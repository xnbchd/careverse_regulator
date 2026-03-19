from __future__ import annotations

from typing import Literal

import frappe

from compliance_360.api.guardrails import require_active_company

LifecycleTrack = Literal["health_worker", "facility"]

HEALTH_WORKER_STATES = [
	"indexed_student",
	"internship_temporary_license",
	"licensed_practitioner",
	"renewal_due",
	"active",
	"restricted",
	"suspended",
	"revoked",
	"reinstated",
]

FACILITY_STATES = [
	"application_submitted",
	"screening",
	"inspection",
	"decision_pending",
	"active",
	"renewal_due",
	"conditional",
	"suspended",
	"revoked",
]

ALLOWED_TRANSITIONS: dict[LifecycleTrack, dict[str, set[str]]] = {
	"health_worker": {
		"indexed_student": {"internship_temporary_license"},
		"internship_temporary_license": {"licensed_practitioner"},
		"licensed_practitioner": {"renewal_due", "restricted", "suspended"},
		"renewal_due": {"active", "restricted", "suspended"},
		"active": {"renewal_due", "restricted", "suspended"},
		"restricted": {"active", "suspended"},
		"suspended": {"reinstated", "revoked"},
		"reinstated": {"active", "renewal_due"},
	},
	"facility": {
		"application_submitted": {"screening"},
		"screening": {"inspection", "decision_pending"},
		"inspection": {"decision_pending"},
		"decision_pending": {"active", "conditional", "revoked"},
		"active": {"renewal_due", "conditional", "suspended"},
		"renewal_due": {"active", "conditional", "suspended"},
		"conditional": {"active", "suspended", "revoked"},
		"suspended": {"active", "revoked"},
	},
}


def is_valid_transition(track: LifecycleTrack, from_state: str, to_state: str) -> bool:
	allowed_targets = ALLOWED_TRANSITIONS.get(track, {}).get(from_state, set())
	return to_state in allowed_targets


@frappe.whitelist()
def get_company_lifecycle_catalog() -> dict:
	"""Return supported lifecycle tracks in the active company tenant context."""
	company = require_active_company()
	return {
		"company": company,
		"health_worker_states": HEALTH_WORKER_STATES,
		"facility_states": FACILITY_STATES,
		"tracks": ["health_worker", "facility"],
	}

