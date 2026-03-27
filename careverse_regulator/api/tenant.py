from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import frappe
from frappe import _

TenantAccessReason = Literal[
	"ok",
	"guest",
	"missing_company_permission",
	"multiple_company_permissions",
]

FALLBACK_FAVICON_URL = "/assets/careverse_regulator/compliance-360/favicon.svg?v=20260313a"


@dataclass(frozen=True)
class TenantContext:
	user: str
	active_company: str | None
	allowed_companies: tuple[str, ...]
	access_allowed: bool
	reason: TenantAccessReason
	message: str | None = None


def _normalize_companies(values: list[str | None]) -> tuple[str, ...]:
	normalized: list[str] = []
	seen: set[str] = set()

	for raw_value in values:
		if not raw_value:
			continue
		company = str(raw_value).strip()
		if not company or company in seen:
			continue
		seen.add(company)
		normalized.append(company)

	return tuple(normalized)


def get_allowed_companies(user: str | None = None) -> tuple[str, ...]:
	"""Return all Companies explicitly allowed for a user via User Permission."""
	current_user = user or frappe.session.user
	if not current_user or current_user == "Guest":
		return ()

	records = frappe.get_all(
		"User Permission",
		filters={"user": current_user, "allow": "Company"},
		pluck="for_value",
	)
	return _normalize_companies(records)


def _tenant_access_message(reason: TenantAccessReason) -> str | None:
	if reason == "missing_company_permission":
		return _(
			"Portal access requires exactly one Company User Permission (Allow = Company). "
			"Contact your system administrator."
		)
	if reason == "multiple_company_permissions":
		return _(
			"Portal access is blocked because your account has multiple Company User Permissions. "
			"Keep only one Company assignment."
		)
	return None


def evaluate_tenant_context(user: str | None = None) -> TenantContext:
	current_user = user or frappe.session.user

	if not current_user or current_user == "Guest":
		return TenantContext(
			user=current_user or "Guest",
			active_company=None,
			allowed_companies=(),
			access_allowed=False,
			reason="guest",
			message=None,
		)

	allowed_companies = get_allowed_companies(current_user)
	if len(allowed_companies) == 1:
		company = allowed_companies[0]
		return TenantContext(
			user=current_user,
			active_company=company,
			allowed_companies=allowed_companies,
			access_allowed=True,
			reason="ok",
			message=None,
		)

	if not allowed_companies:
		reason: TenantAccessReason = "missing_company_permission"
	else:
		reason = "multiple_company_permissions"

	return TenantContext(
		user=current_user,
		active_company=None,
		allowed_companies=allowed_companies,
		access_allowed=False,
		reason=reason,
		message=_tenant_access_message(reason),
	)


def get_company_branding(company: str | None) -> dict:
	"""Return company branding details for UI surfaces."""
	if not company:
		return {
			"name": None,
			"display_name": None,
			"abbr": None,
			"logo": None,
			"favicon_url": FALLBACK_FAVICON_URL,
		}

	company_doc = frappe.db.get_value(
		"Company",
		company,
		["name", "company_name", "abbr", "company_logo"],
		as_dict=True,
	)

	if not company_doc:
		return {
			"name": company,
			"display_name": company,
			"abbr": None,
			"logo": None,
			"favicon_url": FALLBACK_FAVICON_URL,
		}

	display_name = company_doc.get("company_name") or company_doc.get("name") or company
	logo = company_doc.get("company_logo")

	return {
		"name": company_doc.get("name") or company,
		"display_name": display_name,
		"abbr": company_doc.get("abbr"),
		"logo": logo,
		"favicon_url": logo or FALLBACK_FAVICON_URL,
	}


def set_active_company_in_session(company: str | None) -> None:
	"""Persist active company in current server session context."""
	if not company:
		return

	frappe.flags.active_company = company

	session_data = getattr(frappe.local, "session", None)
	if isinstance(session_data, dict):
		session_data["active_company"] = company
		session_data["company"] = company

	session_obj = getattr(frappe.local, "session_obj", None)
	data = getattr(session_obj, "data", None)
	if isinstance(data, dict):
		data["active_company"] = company
		data["company"] = company
		try:
			session_obj.data = data
		except Exception:
			pass

		if hasattr(session_obj, "update"):
			try:
				session_obj.update()
			except Exception:
				pass


def get_active_company(user: str | None = None) -> str | None:
	context = evaluate_tenant_context(user)
	if not context.access_allowed:
		return None

	set_active_company_in_session(context.active_company)
	return context.active_company


def initialize_session_company(login_manager=None) -> None:
	"""Login hook: initialize active company for the authenticated session."""
	context = evaluate_tenant_context()
	if context.access_allowed:
		set_active_company_in_session(context.active_company)
		return

	frappe.flags.active_company = None


def build_tenant_payload(user: str | None = None) -> dict:
	context = evaluate_tenant_context(user)
	if context.access_allowed:
		set_active_company_in_session(context.active_company)
	company_branding = get_company_branding(context.active_company)

	# Include user roles so the frontend can enforce role-based guards
	roles = frappe.get_roles(context.user) if context.user and context.user != "Guest" else []

	return {
		"user": context.user,
		"active_company": context.active_company,
		"company_display_name": company_branding.get("display_name"),
		"company_abbr": company_branding.get("abbr"),
		"company_logo": company_branding.get("logo"),
		"favicon_url": company_branding.get("favicon_url"),
		"company_branding": company_branding,
		"allowed_companies": list(context.allowed_companies),
		"roles": roles,
		"portal_access": {
			"allowed": context.access_allowed,
			"reason": context.reason,
			"message": context.message,
		},
	}


@frappe.whitelist()
def get_user_context() -> dict:
	"""Client-safe context endpoint for company-scoped tenancy."""
	return build_tenant_payload()
