"""
Professional DocType - Manages professional/inspector master data

This DocType stores professional records for regulatory oversight.
Each professional is scoped to a single Company for multi-tenant isolation.

Key Features:
- Auto-assigns company from user context on creation
- Supports soft deletion via disabled flag
- Provides automatic REST API via Frappe ORM
"""

import frappe
from frappe.model.document import Document
from careverse_regulator.api.guardrails import set_doc_company


class Professional(Document):
	"""Professional document controller"""

	def before_insert(self) -> None:
		"""Auto-assign company from user context before saving new professional"""
		# Always clear company field to allow set_doc_company to assign from tenant context
		# This prevents issues with Frappe auto-populating default company values
		self.company = None

		try:
			set_doc_company(self)
		except Exception as e:
			frappe.throw(
				frappe._("Cannot create professional: {0}").format(str(e)),
				title=frappe._("Company Assignment Error")
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
	return f"`tabProfessional`.`company` IN ({company_list})"
