"""Themed logout page for Compliance 360."""

from urllib.parse import urlparse

import frappe
from frappe import _

no_cache = True


def get_context(context):
	redirect_to = frappe.local.request.args.get("redirect-to")

	context.no_cache = 1
	context.no_header = True
	context.no_breadcrumbs = True
	context.title = _("Signing Out - Compliance 360")
	context.redirect_to = sanitize_redirect(redirect_to)
	context.app_name = "Compliance 360"
	context.support_email = "support@careverse.africa"

	return context


def sanitize_redirect(redirect_url):
	default_redirect = "/"

	if not redirect_url:
		return default_redirect

	parsed_redirect = urlparse(redirect_url)
	parsed_request = urlparse(frappe.local.request.url)

	if parsed_redirect.scheme or parsed_redirect.netloc:
		if parsed_redirect.netloc and parsed_redirect.netloc != parsed_request.netloc:
			return default_redirect

	path = parsed_redirect.path or "/"
	fragment = parsed_redirect.fragment or ""
	safe_prefixes = ["/", "/login", "/compliance-360", "/app", "/desk"]

	if not any(
		path == prefix or path.startswith(f"{prefix.rstrip('/')}/")
		for prefix in safe_prefixes
		if prefix != "/"
	):
		if path != "/":
			return default_redirect

	if fragment:
		return f"{path}#{fragment}"

	if parsed_redirect.query:
		return f"{path}?{parsed_redirect.query}"

	return path
