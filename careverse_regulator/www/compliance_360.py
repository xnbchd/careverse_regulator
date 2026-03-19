import frappe
from frappe.utils import get_system_timezone

from compliance_360.api.tenant import build_tenant_payload

no_cache = True


def get_context(context):
    csrf_token = frappe.sessions.get_csrf_token()
    boot = get_boot()
    boot.csrf_token = csrf_token

    context.csrf_token = csrf_token
    context.boot = boot
    context.no_cache = True
    context.no_header = True
    context.no_breadcrumbs = True

    return context


@frappe.whitelist(allow_guest=True)
def get_context_for_dev():
    if not frappe.conf.developer_mode:
        frappe.throw("This method is only meant for developer mode")

    csrf_token = frappe.sessions.get_csrf_token()
    boot = get_boot()
    boot.csrf_token = csrf_token

    # Also set in response header for easy access
    frappe.local.response.csrf_token = csrf_token

    return boot


def get_boot():
    user = frappe.session.user
    is_guest = user == "Guest"
    full_name = "Guest" if is_guest else frappe.utils.get_fullname(user)
    user_image = None if is_guest else frappe.db.get_value("User", user, "user_image")
    roles = [] if is_guest else frappe.get_roles(user)
    tenant_payload = build_tenant_payload(user)
    active_company = tenant_payload.get("active_company")
    allowed_companies = tenant_payload.get("allowed_companies", [])
    portal_access = tenant_payload.get("portal_access", {"allowed": is_guest, "reason": "guest", "message": None})
    company_display_name = tenant_payload.get("company_display_name")
    company_abbr = tenant_payload.get("company_abbr")
    company_logo = tenant_payload.get("company_logo")
    favicon_url = tenant_payload.get("favicon_url")
    company_branding = tenant_payload.get("company_branding") or {}

    return frappe._dict(
        {
            "frappe_version": frappe.__version__,
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
            "session": {
                "user": user,
                "user_fullname": full_name,
                "user_image": user_image,
                "active_company": active_company,
                "company": active_company,
            },
            "user": {
                "name": user,
                "email": user,
                "full_name": full_name,
                "user_image": user_image,
                "roles": roles,
                "company": active_company,
                "company_display_name": company_display_name,
                "company_abbr": company_abbr,
                "company_logo": company_logo,
                "allowed_companies": allowed_companies,
            },
        }
    )
