"""
Custom API endpoints for Inspection operations
Provides enhanced inspection data with linked document display names
"""

import frappe
from frappe import _


@frappe.whitelist()
def get_inspections_with_names():
	"""
	Fetch inspections with facility and professional display names

	Returns list of inspections with:
	- All standard inspection fields
	- facility_name: Display name from linked Facility
	- professional_name: Display name from linked Professional

	Respects permission query conditions for multi-tenant isolation
	"""
	# Get inspections the user has permission to view
	inspections = frappe.get_all(
		"Inspection",
		fields=[
			"name",
			"facility",
			"professional",
			"inspection_date",
			"inspected_date",
			"status",
			"note_to_inspector",
			"company"
		],
		order_by="modified desc",
		limit_page_length=9999
	)

	# Enrich with display names
	result = []
	for inspection in inspections:
		# Get facility display name
		facility_name = None
		if inspection.facility:
			facility_name = frappe.db.get_value("Facility", inspection.facility, "facility_name")

		# Get professional display name
		professional_name = None
		if inspection.professional:
			professional_name = frappe.db.get_value("Professional", inspection.professional, "professional_name")

		# Count findings for this inspection
		finding_count = frappe.db.count("Inspection Finding", {"parent": inspection.name})

		result.append({
			"name": inspection.name,
			"facility": inspection.facility,
			"facility_name": facility_name,
			"professional": inspection.professional,
			"professional_name": professional_name,
			"inspection_date": inspection.inspection_date,
			"inspected_date": inspection.inspected_date,
			"finding_count": finding_count,
			"status": inspection.status,
			"note_to_inspector": inspection.note_to_inspector,
			"company": inspection.company
		})

	return result


@frappe.whitelist()
def get_inspection_with_names(name):
	"""
	Fetch single inspection with facility and professional display names

	Args:
		name: Inspection document name

	Returns:
		Inspection document with enriched display names
	"""
	inspection = frappe.get_doc("Inspection", name)

	# Get facility display name
	facility_name = None
	if inspection.facility:
		facility_name = frappe.db.get_value("Facility", inspection.facility, "facility_name")

	# Get professional display name
	professional_name = None
	if inspection.professional:
		professional_name = frappe.db.get_value("Professional", inspection.professional, "professional_name")

	# Serialize child table findings
	findings = []
	for finding in inspection.findings:
		# Use actual row idx from child table (more stable than enumerate)
		finding_id = f"{inspection.name}-{finding.idx}"

		# Collect attachments from multiple sources
		attachments = []

		# 1. Get attachments from direct attach fields (attachment_1, attachment_2, etc.)
		for i in range(1, 5):
			attach_field = f"attachment_{i}"
			if hasattr(finding, attach_field):
				file_url = getattr(finding, attach_field)
				if file_url:
					# Get file info from File doctype
					file_doc = frappe.db.get_value(
						"File",
						{"file_url": file_url},
						["name", "file_name", "file_size", "is_private"],
						as_dict=True
					)
					if file_doc:
						attachments.append({
							"name": file_doc.name,
							"file_name": file_doc.file_name,
							"file_url": file_url,
							"file_size": file_doc.file_size or 0,
							"is_private": file_doc.is_private or 0
						})
					else:
						# Fallback if file doc not found
						attachments.append({
							"name": file_url,
							"file_name": file_url.split('/')[-1],
							"file_url": file_url,
							"file_size": 0,
							"is_private": 0
						})

		# 2. Also fetch attachments from File doctype (for external system compatibility)
		file_attachments = frappe.get_all(
			"File",
			filters={
				"attached_to_doctype": "Inspection Finding",
				"attached_to_name": finding.name
			},
			fields=["name", "file_name", "file_url", "file_size", "is_private"]
		)

		# Merge, avoiding duplicates based on file_url
		existing_urls = {att["file_url"] for att in attachments}
		for file_att in file_attachments:
			if file_att.file_url not in existing_urls:
				attachments.append(file_att)

		findings.append({
			"name": finding_id,
			"idx": finding.idx,
			"category": finding.category or "",  # Default to empty string if null
			"severity": finding.severity,
			"description": finding.description,
			"status": finding.status,
			"corrective_action": finding.corrective_action or None,
			"due_date": finding.due_date.isoformat() if finding.due_date else None,
			"resolved_date": finding.resolved_date.isoformat() if finding.resolved_date else None,
			"attachments": attachments,
		})

	return {
		"name": inspection.name,
		"facility": inspection.facility,
		"facility_name": facility_name,
		"professional": inspection.professional,
		"professional_name": professional_name,
		"inspection_date": inspection.inspection_date,
		"inspected_date": inspection.inspected_date.isoformat() if inspection.inspected_date else None,
		"findings": findings,
		"status": inspection.status,
		"note_to_inspector": inspection.note_to_inspector,
		"company": inspection.company
	}
