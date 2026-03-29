#!/usr/bin/env python3
"""Build script for Careverse Regulator frontend.

This script is called by Frappe's build system and performs two actions:
1. Runs Vite build to generate hashed assets + manifest.
2. Reads manifest and rewrites hashed asset refs in www/compliance-360.html.
"""

import json
import os
import re
import subprocess

MANIFEST_PATH = "../careverse_regulator/public/compliance-360/.vite/manifest.json"
HTML_TEMPLATE_PATH = "../careverse_regulator/www/compliance_360.html"
ASSET_PREFIX = "/assets/careverse_regulator/compliance-360/assets/"


def build() -> bool:
	try:
		print("=" * 60)
		print("Building Careverse Regulator frontend...")
		print("=" * 60)

		frontend_dir = os.path.dirname(os.path.abspath(__file__))
		original_cwd = os.getcwd()
		os.chdir(frontend_dir)

		try:
			print("\n[1/3] Running npm build...")
			subprocess.run(["npm", "run", "build"], capture_output=True, text=True, check=True)
			print("[ok] Build completed successfully")

			print("\n[2/3] Extracting asset hashes from Vite manifest...")
			js_file, css_file = extract_asset_hashes()
			if js_file:
				print(f"[ok] Found JS file: {js_file}")
			if css_file:
				print(f"[ok] Found CSS file: {css_file}")

			print("\n[3/3] Updating HTML template with hashed assets...")
			update_html_template(js_file, css_file)
			print("[ok] HTML template updated")

			print("\n" + "=" * 60)
			print("Frontend build completed successfully")
			print("=" * 60)
			return True
		finally:
			os.chdir(original_cwd)

	except subprocess.CalledProcessError as exc:
		print(f"\n[error] Build failed: {exc}")
		if exc.stderr:
			print(exc.stderr)
		return False
	except Exception as exc:
		print(f"\n[error] Build error: {exc}")
		return False


def extract_asset_hashes() -> tuple[str | None, str | None]:
	if not os.path.exists(MANIFEST_PATH):
		print(f"Warning: Manifest not found at {MANIFEST_PATH}")
		return None, None

	# Safe: Build-time script with hardcoded constant path, not user input
	# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
	with open(MANIFEST_PATH, encoding="utf-8") as handle:
		manifest = json.load(handle)

	# Look for main entry point (src/main.tsx)
	entry = manifest.get("src/main.tsx") or manifest.get("index.html")
	if not entry:
		return None, None

	js_file = entry.get("file")
	css_files = entry.get("css", [])
	css_file = css_files[0] if css_files else None

	if js_file and js_file.startswith("assets/"):
		js_file = js_file[len("assets/") :]
	if css_file and css_file.startswith("assets/"):
		css_file = css_file[len("assets/") :]

	return js_file, css_file


def update_html_template(js_file: str | None, css_file: str | None) -> None:
	if not os.path.exists(HTML_TEMPLATE_PATH):
		print(f"Warning: HTML template not found at {HTML_TEMPLATE_PATH}")
		return

	# Safe: Build-time script with hardcoded constant path, not user input
	# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
	with open(HTML_TEMPLATE_PATH, encoding="utf-8") as handle:
		html_content = handle.read()

	if css_file:
		css_tag = f'<link rel="stylesheet" crossorigin href="{ASSET_PREFIX}{css_file}">'
		html_content = re.sub(
			r'<link rel="stylesheet" crossorigin href="/assets/careverse_regulator/compliance-360/assets/[^"]+\.css">',
			css_tag,
			html_content,
			count=1,
		)

	if js_file:
		js_tag = f'<script type="module" crossorigin src="{ASSET_PREFIX}{js_file}"></script>'
		html_content = re.sub(
			r'<script type="module" crossorigin src="/assets/careverse_regulator/compliance-360/assets/[^"]+\.js"></script>',
			js_tag,
			html_content,
			count=1,
		)

	# Safe: Build-time script with hardcoded constant path, not user input
	# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
	with open(HTML_TEMPLATE_PATH, "w", encoding="utf-8") as handle:
		handle.write(html_content)


if __name__ == "__main__":
	success = build()
	raise SystemExit(0 if success else 1)
