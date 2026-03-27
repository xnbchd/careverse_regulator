"""Custom landing page for Compliance 360."""

import frappe
from frappe import _
from frappe.core.doctype.navbar_settings.navbar_settings import get_app_logo

no_cache = True


def get_context(context):
	if frappe.session.user != "Guest":
		frappe.local.flags.redirect_location = "/compliance-360"
		raise frappe.Redirect

	context.no_cache = 1
	context.no_header = True
	context.no_breadcrumbs = True
	context.title = _("Healthcare Regulator Platform - Compliance 360")

	context.app_name = "Compliance 360"
	context.logo = get_app_logo() or "/assets/careverse_regulator/compliance-360/favicon.svg?v=20260313a"

	context.cta_text = "Get Started"
	context.cta_link = "/login?redirect-to=/compliance-360"
	context.cta_secondary_text = "Sign In"
	context.cta_secondary_link = "/login?redirect-to=/compliance-360"

	context.features = [
		{
			"icon": "📋",
			"title": "License Management",
			"description": "Automated tracking, renewal reminders, and compliance checks for professional and facility licenses.",
		},
		{
			"icon": "✓",
			"title": "Compliance Tracking",
			"description": "Real-time monitoring of compliance requirements with alerts and follow-up actions.",
		},
		{
			"icon": "📊",
			"title": "Regulatory Reporting",
			"description": "Operational and regulatory reporting for inspections, renewals, and enforcement status.",
		},
		{
			"icon": "🏥",
			"title": "Facility Oversight",
			"description": "Company-scoped oversight of licensed health facilities and inspection outcomes.",
		},
		{
			"icon": "👥",
			"title": "Health Worker Lifecycle",
			"description": "Track progression from indexing and internship licenses through full registration and renewal.",
		},
		{
			"icon": "🔒",
			"title": "Secure & Auditable",
			"description": "Role-based access with immutable activity history and accountability by regulator company.",
		},
	]

	return context
