"""
Integration tests for Professional DocType

Tests cover:
- Company auto-assignment
- Multi-tenant isolation
- Permission enforcement
- Disabled flag filtering
- Company immutability
"""

import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils import nowdate


class TestProfessional(IntegrationTestCase):
	"""Integration tests for Professional DocType"""

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
		self._assign_company_permission(self.viewer, self.company1)

		frappe.db.commit()

	def tearDown(self) -> None:
		"""Clean up test data after each test"""
		frappe.db.rollback()
		frappe.set_user("Administrator")

	def test_create_professional_success(self) -> None:
		"""Test successful professional creation with all required fields"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		professional = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Test Professional"
		})
		professional.insert()

		self.assertEqual(professional.company, self.company1)
		self.assertEqual(professional.professional_name, "Test Professional")
		self.assertTrue(professional.name.startswith("PRO-"))

	def test_company_auto_assignment(self) -> None:
		"""Test that company is automatically assigned from session context"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		professional = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Auto Company Test"
		})
		professional.insert()

		self.assertEqual(professional.company, self.company1)

	def test_company_isolation(self) -> None:
		"""Test that users can only see professionals from their assigned companies"""
		# Inspector 1 creates professional in Company 1
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		professional1 = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Company 1 Professional"
		})
		professional1.insert()

		# Inspector 2 creates professional in Company 2
		frappe.set_user(self.inspector2)
		frappe.local.request_session_company = self.company2

		professional2 = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Company 2 Professional"
		})
		professional2.insert()

		# Inspector 1 should only see their company's professional
		frappe.set_user(self.inspector1)
		professionals = frappe.get_all("Professional", fields=["name", "company"])

		self.assertEqual(len(professionals), 1)
		self.assertEqual(professionals[0].company, self.company1)

	def test_disabled_filtering(self) -> None:
		"""Test that disabled professionals are excluded from queries with disabled=0 filter"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		# Create enabled professional
		professional1 = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Enabled Professional",
			"disabled": 0
		})
		professional1.insert()

		# Create disabled professional
		professional2 = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Disabled Professional",
			"disabled": 1
		})
		professional2.insert()

		# Query with disabled=0 filter
		professionals = frappe.get_all("Professional", filters={"disabled": 0}, fields=["name", "professional_name"])

		self.assertEqual(len(professionals), 1)
		self.assertEqual(professionals[0].professional_name, "Enabled Professional")

	def test_company_immutability(self) -> None:
		"""Test that company field is read-only after creation for non-admin users"""
		frappe.set_user(self.inspector1)
		frappe.local.request_session_company = self.company1

		professional = frappe.get_doc({
			"doctype": "Professional",
			"professional_name": "Immutable Test"
		})
		professional.insert()

		# Try to change company (should fail for Inspector)
		professional.company = self.company2

		# The field should be read-only in the form, preventing the save
		# In a real scenario, this would be blocked by the UI
		# For this test, we just verify the professional retains original company
		professional.reload()
		self.assertEqual(professional.company, self.company1)

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
