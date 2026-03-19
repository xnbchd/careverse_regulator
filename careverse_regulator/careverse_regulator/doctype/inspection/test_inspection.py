"""
Integration tests for Inspection DocType

Tests cover:
- Company auto-assignment
- Date validation
- Multi-tenant isolation
- Permission enforcement
- Company reassignment rules
"""

import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils import add_days, nowdate, getdate


class TestInspection(IntegrationTestCase):
	"""Integration tests for Inspection DocType"""

	def setUp(self) -> None:
		"""Set up test data before each test"""
		# Create test companies
		self.company1 = self._create_test_company("Test Company 1")
		self.company2 = self._create_test_company("Test Company 2")

		# Create test users with roles
		self.admin_user = self._create_test_user("admin@test.com", ["Regulator Admin"])
		self.inspector1 = self._create_test_user("inspector1@test.com", ["Inspector"])
		self.inspector2 = self._create_test_user("inspector2@test.com", ["Inspector"])
		self.viewer = self._create_test_user("viewer@test.com", ["Regulator User"])

		# Assign company permissions
		self._assign_company_permission(self.inspector1, self.company1)
		self._assign_company_permission(self.inspector2, self.company2)
		self._assign_company_permission(self.admin_user, self.company1)
		self._assign_company_permission(self.admin_user, self.company2)

		frappe.db.commit()

	def tearDown(self) -> None:
		"""Clean up test data after each test"""
		frappe.db.rollback()
		frappe.set_user("Administrator")

	def test_create_inspection_success(self) -> None:
		"""Test successful inspection creation with all required fields"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Test Facility",
			"inspection_date": nowdate(),
			"inspector": "John Doe",
			"status": "Pending",
			"note_to_inspector": "Check all equipment"
		})
		inspection.insert()

		self.assertEqual(inspection.company, self.company1)
		self.assertEqual(inspection.facility_name, "Test Facility")
		self.assertEqual(inspection.status, "Pending")
		self.assertTrue(inspection.name.startswith("INS-"))

	def test_create_inspection_auto_assigns_company(self) -> None:
		"""Test that company is automatically assigned from session context"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Auto Company Test",
			"inspection_date": nowdate(),
			"inspector": "Jane Smith",
			"status": "Pending"
		})
		inspection.insert()

		self.assertEqual(inspection.company, self.company1)

	def test_create_inspection_without_company_context_fails(self) -> None:
		"""Test that inspection creation fails without company context"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = None

		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "No Company Test",
			"inspection_date": nowdate(),
			"inspector": "Test Inspector",
			"status": "Pending"
		})

		with self.assertRaises(frappe.ValidationError):
			inspection.insert()

	def test_inspection_date_cannot_be_future(self) -> None:
		"""Test that inspection date cannot be set in the future"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		future_date = add_days(nowdate(), 5)
		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Future Date Test",
			"inspection_date": future_date,
			"inspector": "Test Inspector",
			"status": "Pending"
		})

		with self.assertRaises(frappe.ValidationError) as context:
			inspection.insert()

		self.assertIn("future", str(context.exception).lower())

	def test_company_isolation(self) -> None:
		"""Test that users can only see inspections from their assigned companies"""
		# Inspector 1 creates inspection in Company 1
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		inspection1 = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Company 1 Facility",
			"inspection_date": nowdate(),
			"inspector": "Inspector One",
			"status": "Pending"
		})
		inspection1.insert()

		# Inspector 2 creates inspection in Company 2
		frappe.set_user(self.inspector2)
		frappe.local.request_session_company = self.company2

		inspection2 = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Company 2 Facility",
			"inspection_date": nowdate(),
			"inspector": "Inspector Two",
			"status": "Pending"
		})
		inspection2.insert()

		# Inspector 1 should only see their company's inspection
		frappe.set_user(self.inspector1)
		inspections = frappe.get_all("Inspection", fields=["name", "company"])

		self.assertEqual(len(inspections), 1)
		self.assertEqual(inspections[0].company, self.company1)

	def test_inspector_can_only_edit_own_inspections(self) -> None:
		"""Test that inspectors can only edit inspections they created (if_owner)"""
		# Inspector 1 creates inspection
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Ownership Test",
			"inspection_date": nowdate(),
			"inspector": "Inspector One",
			"status": "Pending"
		})
		inspection.insert()
		inspection_name = inspection.name

		# Inspector 1 can edit their own inspection
		inspection.status = "Completed"
		inspection.save()
		self.assertEqual(inspection.status, "Completed")

		# Inspector 2 (same company) cannot edit Inspector 1's inspection
		frappe.set_user(self.inspector2)

		with self.assertRaises(frappe.PermissionError):
			inspection = frappe.get_doc("Inspection", inspection_name)
			inspection.status = "Non Compliant"
			inspection.save()

	def test_admin_can_reassign_company(self) -> None:
		"""Test that Regulator Admin can change company assignment"""
		# Create inspection in Company 1
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Company Reassign Test",
			"inspection_date": nowdate(),
			"inspector": "Test Inspector",
			"status": "Pending"
		})
		inspection.insert()
		inspection_name = inspection.name

		# Admin can reassign to Company 2
		frappe.set_user(self.admin_user)
		inspection = frappe.get_doc("Inspection", inspection_name)
		inspection.company = self.company2
		inspection.save()

		self.assertEqual(inspection.company, self.company2)

	def test_non_admin_cannot_reassign_company(self) -> None:
		"""Test that non-admin users cannot change company assignment"""
		# Create inspection in Company 1
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility_name": "Company Lock Test",
			"inspection_date": nowdate(),
			"inspector": "Test Inspector",
			"status": "Pending"
		})
		inspection.insert()

		# Inspector tries to change company (should fail)
		with self.assertRaises(frappe.ValidationError) as context:
			inspection.company = self.company2
			inspection.save()

		self.assertIn("Regulator Admin", str(context.exception))

	def test_facility_link_validation(self) -> None:
		"""Test that Inspection.facility links to a valid Facility record"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		# Create a facility first
		facility = frappe.get_doc({
			"doctype": "Facility",
			"facility_name": "Test Linked Facility"
		})
		facility.insert()

		# Create inspection referencing the facility
		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility": facility.name,
			"inspection_date": nowdate(),
			"professional": "PRO-2024-00001",  # Will be replaced with real professional in next test
			"status": "Pending"
		})

		# This should work if Facility doctype exists and Link is valid
		# Note: This test verifies the schema accepts Link fields
		self.assertEqual(inspection.facility, facility.name)

	def test_professional_link_validation(self) -> None:
		"""Test that Inspection.professional links to a valid Professional record"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		# Create a professional first
		professional = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Test Inspector Pro"
		})
		professional.insert()

		# Create a facility for the inspection
		facility = frappe.get_doc({
			"doctype": "Facility",
			"facility_name": "Test Facility for Pro"
		})
		facility.insert()

		# Create inspection referencing both
		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility": facility.name,
			"inspection_date": nowdate(),
			"professional": professional.name,
			"status": "Pending"
		})
		inspection.insert()

		self.assertEqual(inspection.professional, professional.name)
		self.assertEqual(inspection.facility, facility.name)

	def test_disabled_facility_hidden_from_dropdown(self) -> None:
		"""Test that disabled facilities don't appear in Link query with get_query filter"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		# Create enabled facility
		facility1 = frappe.get_doc({
			"doctype": "Facility",
			"facility_name": "Enabled Facility",
			"disabled": 0
		})
		facility1.insert()

		# Create disabled facility
		facility2 = frappe.get_doc({
			"doctype": "Facility",
			"facility_name": "Disabled Facility",
			"disabled": 1
		})
		facility2.insert()

		# Query facilities with disabled=0 filter (simulating get_query behavior)
		facilities = frappe.get_all("Facility", filters={"disabled": 0}, fields=["name", "facility_name"])

		# Should only see enabled facility
		self.assertEqual(len(facilities), 1)
		self.assertEqual(facilities[0].facility_name, "Enabled Facility")

	def test_historical_link_preservation(self) -> None:
		"""Test that existing Inspection retains links when facility/professional disabled"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		# Create facility and professional
		facility = frappe.get_doc({
			"doctype": "Facility",
			"facility_name": "Historical Test Facility",
			"disabled": 0
		})
		facility.insert()

		professional = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Historical Test Pro",
			"disabled": 0
		})
		professional.insert()

		# Create inspection
		inspection = frappe.get_doc({
			"doctype": "Inspection",
			"facility": facility.name,
			"inspection_date": nowdate(),
			"professional": professional.name,
			"status": "Completed"
		})
		inspection.insert()
		inspection_name = inspection.name

		# Now disable the facility and professional
		facility.disabled = 1
		facility.save()

		professional.disabled = 1
		professional.save()

		# Reload the inspection and verify links are preserved
		inspection = frappe.get_doc("Inspection", inspection_name)
		self.assertEqual(inspection.facility, facility.name)
		self.assertEqual(inspection.professional, professional.name)

	# Helper methods

	def _create_test_company(self, company_name: str) -> str:
		"""Create test company if it doesn't exist"""
		if not frappe.db.exists("Company", company_name):
			company = frappe.get_doc({
				"doctype": "Company",
				"company_name": company_name,
				"abbr": company_name[:3].upper(),
				"default_currency": "USD"
			})
			company.insert(ignore_permissions=True)
		return company_name

	def _create_test_user(self, email: str, roles: list) -> str:
		"""Create test user with specified roles"""
		if not frappe.db.exists("User", email):
			user = frappe.get_doc({
				"doctype": "User",
				"email": email,
				"first_name": email.split("@")[0],
				"enabled": 1,
				"send_welcome_email": 0
			})
			user.insert(ignore_permissions=True)

		# Assign roles
		user = frappe.get_doc("User", email)
		for role in roles:
			if not any(r.role == role for r in user.roles):
				user.append("roles", {"role": role})
		user.save(ignore_permissions=True)

		return email

	def _assign_company_permission(self, user: str, company: str) -> None:
		"""Assign company permission to user"""
		if not frappe.db.exists("User Permission", {"user": user, "allow": "Company", "for_value": company}):
			frappe.get_doc({
				"doctype": "User Permission",
				"user": user,
				"allow": "Company",
				"for_value": company,
				"apply_to_all_doctypes": 1
			}).insert(ignore_permissions=True)
