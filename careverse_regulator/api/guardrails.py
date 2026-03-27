from __future__ import annotations

from typing import Any

import frappe
from frappe import _

from careverse_regulator.api.tenant import evaluate_tenant_context, set_active_company_in_session


def require_active_company(user: str | None = None) -> str:
	"""Require an active company context for any mutable/read operation."""
	context = evaluate_tenant_context(user)
	if not context.access_allowed or not context.active_company:
		frappe.throw(
			context.message or _("Active company context is required for this operation."),
			frappe.PermissionError,
		)

	set_active_company_in_session(context.active_company)
	return context.active_company


def with_company_filter(filters: dict[str, Any] | None = None, user: str | None = None) -> dict[str, Any]:
	"""Inject and enforce company filter from session context."""
	company = require_active_company(user)
	normalized_filters = dict(filters or {})

	requested_company = normalized_filters.get("company")
	if requested_company and str(requested_company).strip() != company:
		frappe.throw(_("Cross-company filters are not allowed."), frappe.PermissionError)

	normalized_filters["company"] = company
	return normalized_filters


def set_doc_company(doc: Any, user: str | None = None) -> None:
	"""Stamp company from active session and reject foreign company payloads."""
	company = require_active_company(user)
	doc_company = getattr(doc, "company", None)

	if doc_company and str(doc_company).strip() != company:
		frappe.throw(_("Company mismatch in request payload."), frappe.PermissionError)

	doc.company = company


def has_company_permission(
	doc: Any, user: str | None = None, permission_type: str | None = None
) -> bool | None:
	"""Generic permission guard for doctypes that contain a `company` field."""
	if not hasattr(doc, "company"):
		return None

	company = require_active_company(user)
	doc_company = str(getattr(doc, "company", "")).strip()
	return doc_company == company
