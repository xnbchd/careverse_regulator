app_name = "careverse_regulator"
app_title = "Careverse Regulator"
app_publisher = "Salim"
app_description = "Agencies and Regulators Portal"
app_email = "salim@tiberbu.com"
app_license = "mit"

# Public landing page
home_page = "index"

# Build hooks for frontend assets
build_hooks = {
	"before_build": "careverse_regulator.build.before_build",
	"after_build": "careverse_regulator.build.after_build",
}

# Run frontend build after migration to keep assets synchronized.
after_migrate = [
	"careverse_regulator.build.run_frontend_build",
]

on_session_creation = "careverse_regulator.api.tenant.initialize_session_company"

website_route_rules = [
	{"from_route": "/login", "to_route": "login"},
	{"from_route": "/logout", "to_route": "logout"},
	{"from_route": "/compliance-360", "to_route": "compliance_360"},
	{"from_route": "/compliance-360/<path:app_path>", "to_route": "compliance_360"},
]
