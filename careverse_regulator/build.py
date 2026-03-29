import os
import re
import subprocess
import sys

import frappe

APP_NAME = "careverse_regulator"
PUBLIC_FRONTEND_DIR = "compliance-360"
WWW_TEMPLATE = "compliance-360.html"


def before_build():
	"""Build frontend assets before Frappe build process."""
	try:
		call_frontend_build_script()
	except Exception as exc:
		frappe.log_error(f"Frontend build failed: {exc}", "Careverse Regulator Build Error")
		print(f"Warning: Frontend build failed: {exc}")


def after_build():
	"""Post-build verification."""
	try:
		verify_build_assets()
	except Exception as exc:
		frappe.log_error(f"Build verification failed: {exc}", "Careverse Regulator Build Verification")
		print(f"Warning: Build verification failed: {exc}")


def _resolve_app_root() -> str:
	"""Resolve app root path from the installed app path."""
	try:
		app_path = frappe.get_app_path(APP_NAME)
		return os.path.dirname(app_path)
	except Exception:
		return os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def call_frontend_build_script():
	"""Call frontend/build.py to build and update assets."""
	app_root = _resolve_app_root()
	build_script = os.path.join(app_root, "frontend", "build.py")

	if not os.path.exists(build_script):
		print(f"Frontend build script not found at {build_script}")
		return

	print("=" * 60)
	print("Executing frontend build script...")
	print("=" * 60)

	result = subprocess.run(
		[sys.executable, build_script],
		capture_output=True,
		text=True,
		check=False,
	)

	if result.stdout:
		print(result.stdout)
	if result.stderr:
		print(result.stderr)

	if result.returncode != 0:
		raise Exception(f"Frontend build script failed with return code {result.returncode}")

	print("=" * 60)
	print("Frontend build script completed successfully")
	print("=" * 60)


def verify_build_assets():
	"""Verify built assets exist and template points to asset files."""
	app_root = _resolve_app_root()
	app_dir = os.path.join(app_root, APP_NAME)

	assets_dir = os.path.join(app_dir, "public", PUBLIC_FRONTEND_DIR, "assets")
	html_file = os.path.join(app_dir, "www", WWW_TEMPLATE)

	if not os.path.exists(assets_dir):
		raise Exception(f"Assets directory not found after build: {assets_dir}")

	if not os.path.exists(html_file):
		raise Exception(f"HTML file not found in www directory: {html_file}")

	# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
	# Safe: Build-time script with controlled path derived from app structure, not user input
	with open(html_file, encoding="utf-8") as handle:
		html_content = handle.read()

	js_matches = re.findall(r'src="[^"]*assets/([^"]*\.js)"', html_content)
	css_matches = re.findall(r'href="[^"]*assets/([^"]*\.css)"', html_content)

	for js_file in js_matches:
		if not os.path.exists(os.path.join(assets_dir, js_file)):
			raise Exception(f"Referenced JS file not found: {js_file}")

	for css_file in css_matches:
		if not os.path.exists(os.path.join(assets_dir, css_file)):
			raise Exception(f"Referenced CSS file not found: {css_file}")

	print("Build verification completed successfully")


def run_frontend_build():
	"""Run frontend build after migration, without failing migration flow on error."""
	try:
		frappe.logger().info("Starting Careverse Regulator frontend build after migration...")
		call_frontend_build_script()
		frappe.logger().info("Careverse Regulator frontend build completed successfully after migration")
	except Exception as exc:
		frappe.log_error(
			f"Frontend build failed after migration: {exc}",
			"Careverse Regulator Post-Migration Build Error",
		)
