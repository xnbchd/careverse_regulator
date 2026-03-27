"""Custom login page for Compliance 360."""

from urllib.parse import urlparse

import frappe
from frappe import _
from frappe.core.doctype.navbar_settings.navbar_settings import get_app_logo
from frappe.utils.oauth import get_oauth2_providers

no_cache = True


def get_context(context):
	"""Setup context for custom login page."""
	redirect_to = frappe.local.request.args.get("redirect-to")
	redirect_to = sanitize_redirect(redirect_to)

	if frappe.session.user != "Guest":
		frappe.local.flags.redirect_location = redirect_to or "/compliance-360"
		raise frappe.Redirect

	context.no_cache = 1
	context.no_header = True
	context.no_breadcrumbs = True
	context.title = _("Sign In - Compliance 360")

	context.app_name = "Compliance 360"
	context.logo = get_app_logo() or "/assets/careverse_regulator/compliance-360/favicon.svg?v=20260313a"

	context.disable_signup = frappe.get_website_settings("disable_signup") or 0
	context.disable_user_pass_login = frappe.get_system_settings("disable_user_pass_login") or 0
	context.login_with_email_link = frappe.get_system_settings("login_with_email_link") or 0

	login_label = []
	if frappe.utils.cint(frappe.get_system_settings("allow_login_using_mobile_number")):
		login_label.append(_("Mobile"))
	if frappe.utils.cint(frappe.get_system_settings("allow_login_using_user_name")):
		login_label.append(_("Username"))
	login_label.append(_("Email"))
	context.login_label = f" {_('or')} ".join(login_label)
	context.login_name_placeholder = login_label[0]

	context.provider_logins = get_oauth2_providers()

	from frappe.integrations.doctype.ldap_settings.ldap_settings import LDAPSettings

	if frappe.db.get_value("LDAP Settings", "LDAP Settings", "enabled"):
		context.ldap_settings = LDAPSettings.get_ldap_client_settings()

	context.redirect_to = redirect_to or "/compliance-360"

	return context


def sanitize_redirect(redirect_url):
	"""Prevent open redirect vulnerabilities."""
	default_redirect = "/compliance-360"
	if not redirect_url:
		return default_redirect

	parsed_redirect = urlparse(redirect_url)
	parsed_request = urlparse(frappe.local.request.url)

	if parsed_redirect.scheme or parsed_redirect.netloc:
		if parsed_request.netloc != parsed_redirect.netloc:
			return default_redirect

	if not redirect_url.startswith("/"):
		redirect_url = "/" + redirect_url

	safe_paths = ["/compliance-360", "/desk", "/api", "/app"]
	is_safe = any(redirect_url.startswith(path) for path in safe_paths)

	if not is_safe and redirect_url not in ["/", "/home"]:
		return default_redirect

	return redirect_url
