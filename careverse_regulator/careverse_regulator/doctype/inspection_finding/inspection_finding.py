import frappe
from frappe import _
from frappe.model.document import Document

class InspectionFinding(Document):
    def validate(self):
        """Validate finding fields before save"""
        self.validate_severity()
        self.validate_status()
        self.validate_category()

    def validate_severity(self):
        """Ensure severity is one of allowed values"""
        allowed_severities = ["Critical", "Major", "Minor"]
        if self.severity and self.severity not in allowed_severities:
            frappe.throw(
                _("Severity must be one of: {0}").format(", ".join(allowed_severities)),
                title=_("Invalid Severity")
            )

    def validate_status(self):
        """Ensure status is one of allowed values"""
        allowed_statuses = ["Open", "In Progress", "Resolved"]
        if self.status and self.status not in allowed_statuses:
            frappe.throw(
                _("Status must be one of: {0}").format(", ".join(allowed_statuses)),
                title=_("Invalid Status")
            )

    def validate_category(self):
        """Ensure category is not empty or whitespace-only"""
        if self.category and not self.category.strip():
            frappe.throw(
                _("Category cannot be empty or whitespace"),
                title=_("Invalid Category")
            )
