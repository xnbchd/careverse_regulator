"""
Data migration patch to convert Inspection from Data fields to Link fields.

This patch:
1. Creates Facility records from existing facility_name values
2. Creates Professional records from existing inspector values
3. Updates Inspection records to use the new Link fields
"""

import frappe
from frappe import _


def execute():
	"""Execute the data migration for Inspection doctype."""
	frappe.reload_doc("careverse_regulator", "doctype", "facility")
	frappe.reload_doc("careverse_regulator", "doctype", "professional")
	frappe.reload_doc("careverse_regulator", "doctype", "inspection")

	# Check if table exists first
	if not frappe.db.table_exists("tabInspection"):
		frappe.logger().info("Inspection table does not exist yet, skipping migration")
		return

	# Check if old fields exist (this patch should run only once)
	if not frappe.db.has_column("tabInspection", "facility_name"):
		frappe.log_error(
			"Migration already complete or old schema not found",
			"Inspection Migration"
		)
		return

	migrate_facilities()
	migrate_professionals()
	migrate_inspections()

	frappe.db.commit()


def migrate_facilities():
	"""Create Facility records from unique facility_name values."""
	# Get all unique facility names with their company
	inspections = frappe.db.sql("""
		SELECT DISTINCT facility_name, company
		FROM `tabInspection`
		WHERE facility_name IS NOT NULL AND facility_name != ''
		ORDER BY facility_name
	""", as_dict=True)

	facility_map = {}

	for inspection in inspections:
		facility_name = inspection.facility_name
		company = inspection.company

		# Skip if we already created this facility
		if (facility_name, company) in facility_map:
			continue

		# Check if facility already exists
		existing = frappe.db.exists("Facility", {
			"facility_name": facility_name,
			"company": company
		})

		if existing:
			facility_map[(facility_name, company)] = existing
			continue

		# Create new facility
		try:
			facility = frappe.get_doc({
				"doctype": "Facility",
				"facility_name": facility_name,
				"company": company,
				"disabled": 0
			})
			facility.insert(ignore_permissions=True)
			facility_map[(facility_name, company)] = facility.name
			frappe.logger().info(f"Created Facility: {facility.name} for {facility_name}")
		except Exception as e:
			frappe.log_error(
				f"Failed to create Facility for {facility_name}: {str(e)}",
				"Facility Migration Error"
			)

	frappe.db.commit()


def migrate_professionals():
	"""Create Professional records from unique inspector values."""
	# Get all unique inspector names with their company
	inspections = frappe.db.sql("""
		SELECT DISTINCT inspector, company
		FROM `tabInspection`
		WHERE inspector IS NOT NULL AND inspector != ''
		ORDER BY inspector
	""", as_dict=True)

	professional_map = {}

	for inspection in inspections:
		inspector = inspection.inspector
		company = inspection.company

		# Skip if we already created this professional
		if (inspector, company) in professional_map:
			continue

		# Check if professional already exists
		existing = frappe.db.exists("Professional", {
			"professional_name": inspector,
			"company": company
		})

		if existing:
			professional_map[(inspector, company)] = existing
			continue

		# Create new professional
		try:
			professional = frappe.get_doc({
				"doctype": "Professional",
				"professional_name": inspector,
				"company": company,
				"disabled": 0
			})
			professional.insert(ignore_permissions=True)
			professional_map[(inspector, company)] = professional.name
			frappe.logger().info(f"Created Professional: {professional.name} for {inspector}")
		except Exception as e:
			frappe.log_error(
				f"Failed to create Professional for {inspector}: {str(e)}",
				"Professional Migration Error"
			)

	frappe.db.commit()


def migrate_inspections():
	"""Update Inspection records to link to Facility and Professional."""
	# Get all inspections
	inspections = frappe.db.sql("""
		SELECT name, facility_name, inspector, company
		FROM `tabInspection`
		WHERE facility_name IS NOT NULL AND inspector IS NOT NULL
	""", as_dict=True)

	updated_count = 0
	error_count = 0

	for inspection_data in inspections:
		try:
			# Find the corresponding Facility
			facility = frappe.db.get_value("Facility", {
				"facility_name": inspection_data.facility_name,
				"company": inspection_data.company
			}, "name")

			# Find the corresponding Professional
			professional = frappe.db.get_value("Professional", {
				"professional_name": inspection_data.inspector,
				"company": inspection_data.company
			}, "name")

			if not facility:
				frappe.log_error(
					f"Facility not found for {inspection_data.facility_name} in {inspection_data.company}",
					"Inspection Migration Error"
				)
				error_count += 1
				continue

			if not professional:
				frappe.log_error(
					f"Professional not found for {inspection_data.inspector} in {inspection_data.company}",
					"Inspection Migration Error"
				)
				error_count += 1
				continue

			# Update the inspection with Link fields
			frappe.db.set_value("Inspection", inspection_data.name, {
				"facility": facility,
				"professional": professional
			}, update_modified=False)

			updated_count += 1

		except Exception as e:
			frappe.log_error(
				f"Failed to update Inspection {inspection_data.name}: {str(e)}",
				"Inspection Migration Error"
			)
			error_count += 1

	frappe.logger().info(
		f"Migration complete: {updated_count} inspections updated, {error_count} errors"
	)
	frappe.db.commit()
