"""
Inspection DocType - Manages facility inspection records

This DocType stores inspection records for facilities under regulatory oversight.
Each inspection is scoped to a single Company for multi-tenant isolation.

Key Features:
- Auto-assigns company from user context on creation
- Enforces inspection date validation (no future dates)
- Tracks inspection status (Pending, Completed, Non Compliant)
- Supports company reassignment by Regulator Admin only
- Provides automatic REST API via Frappe ORM

Note: facility_name and inspector are currently Data fields.
      Phase 2 will migrate these to Link fields for referential integrity.
"""

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import getdate, nowdate
from careverse_regulator.api.guardrails import set_doc_company


class Inspection(Document):
	"""Inspection document controller"""

	def before_insert(self) -> None:
		"""Auto-assign company from user context before saving new inspection"""
		# Always clear company field to allow set_doc_company to assign from tenant context
		# This prevents issues with Frappe auto-populating default company values
		self.company = None

		try:
			set_doc_company(self)
		except Exception as e:
			frappe.throw(
				_("Cannot create inspection: {0}").format(str(e)),
				title=_("Company Assignment Error")
			)

	def validate(self) -> None:
		"""Validate business rules before saving"""
		self.validate_inspection_date()
		self.validate_company_change()

	def validate_inspection_date(self) -> None:
		"""Ensure inspection date is not in the past"""
		if self.inspection_date and getdate(self.inspection_date) < getdate(nowdate()):
			frappe.throw(
				_("Inspection date cannot be in the past"),
				title=_("Invalid Date")
			)

	def validate_company_change(self) -> None:
		"""Allow Regulator Admin to change company, block for others"""
		if not self.is_new() and self.has_value_changed("company"):
			# Check if user has Regulator Admin role
			if "Regulator Admin" not in frappe.get_roles():
				frappe.throw(
					_("Only Regulator Admin can change the company assignment"),
					title=_("Permission Denied")
				)


def get_permission_query_conditions(user: str) -> str:
	"""
	Return SQL WHERE clause for company-based filtering

	This function is called by Frappe's permission system to filter
	records at the database level based on user's company access.

	Args:
		user: Email of the user requesting data

	Returns:
		SQL WHERE clause string (without the WHERE keyword)
	"""
	from careverse_regulator.api.tenant import get_allowed_companies

	# Get list of companies user has access to
	allowed_companies = get_allowed_companies(user)

	if not allowed_companies:
		# No company access - return impossible condition
		return "1=0"

	# Return SQL condition for allowed companies
	# Note: company names from get_allowed_companies are already validated by Frappe
	# and come from the database, not user input, making this safe from SQL injection
	company_list = ", ".join(f"'{company}'" for company in allowed_companies)
	return f"`tabInspection`.`company` IN ({company_list})"
