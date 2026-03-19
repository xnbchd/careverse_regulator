import frappe
from frappe.utils import get_system_timezone

from compliance_360.api.tenant import build_tenant_payload

no_cache = 1


def get_context():
	csrf_token = frappe.sessions.get_csrf_token()
	context = frappe._dict()
	context.boot = get_boot()
	context.boot.csrf_token = csrf_token
	return context


@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_context_for_dev():
	if not frappe.conf.developer_mode:
		frappe.throw("This method is only meant for developer mode")
	return get_boot()


def get_boot():
	tenant_payload = build_tenant_payload()
	active_company = tenant_payload.get("active_company")
	allowed_companies = tenant_payload.get("allowed_companies", [])
	portal_access = tenant_payload.get("portal_access")
	company_display_name = tenant_payload.get("company_display_name")
	company_abbr = tenant_payload.get("company_abbr")
	company_logo = tenant_payload.get("company_logo")
	favicon_url = tenant_payload.get("favicon_url")
	company_branding = tenant_payload.get("company_branding") or {}

	return frappe._dict(
		{
			"frappe_version": frappe.version,
			"site_name": frappe.local.site,
			"read_only_mode": frappe.flags.read_only,
			"system_timezone": get_system_timezone(),
			"active_company": active_company,
			"company_display_name": company_display_name,
			"company_abbr": company_abbr,
			"company_logo": company_logo,
			"favicon_url": favicon_url,
			"company_branding": company_branding,
			"allowed_companies": allowed_companies,
			"portal_access": portal_access,
		}
	)
