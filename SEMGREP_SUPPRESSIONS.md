# Semgrep Suppressions Documentation

This document explains why certain Semgrep findings have been suppressed with inline comments.

## File Traversal Warnings (frappe-security-file-traversal)

### Context

The Frappe Semgrep rules flag any file system access (`open()` calls) as potential file traversal
vulnerabilities. This is a good security practice for **runtime code** that handles user input.

### Suppressions Applied

The following `open()` calls have been suppressed with `nosemgrep` comments:

#### 1. `careverse_regulator/build.py:88`

```python
# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
# Safe: Build-time script with controlled path derived from app structure, not user input
with open(html_file, encoding="utf-8") as handle:
    html_content = handle.read()
```

**Why it's safe:**

- This is a **build-time script**, not runtime application code
- The path (`html_file`) is constructed from:
  - `app_root`: Derived from `frappe.get_app_path()` (trusted Frappe API)
  - `WWW_TEMPLATE`: Hardcoded constant `"compliance-360.html"`
- No user input influences the file path
- Called only during `bench build` or migration, not during user requests

#### 2. `frontend/build.py:68`

```python
# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
# Safe: Build-time script with hardcoded constant path, not user input
with open(MANIFEST_PATH, encoding="utf-8") as handle:
    manifest = json.load(handle)
```

**Why it's safe:**

- `MANIFEST_PATH` is a **hardcoded module-level constant**:
  ```python
  MANIFEST_PATH = "../careverse_regulator/public/compliance-360/.vite/manifest.json"
  ```
- No user input or dynamic path construction
- Only executed during frontend build process

#### 3. `frontend/build.py:94`

```python
# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
# Safe: Build-time script with hardcoded constant path, not user input
with open(HTML_TEMPLATE_PATH, encoding="utf-8") as handle:
    html_content = handle.read()
```

**Why it's safe:**

- `HTML_TEMPLATE_PATH` is a **hardcoded module-level constant**:
  ```python
  HTML_TEMPLATE_PATH = "../careverse_regulator/www/compliance_360.html"
  ```
- No user input or dynamic path construction
- Only executed during frontend build process

#### 4. `frontend/build.py:116`

```python
# nosemgrep: frappe-semgrep-rules.rules.security.frappe-security-file-traversal
# Safe: Build-time script with hardcoded constant path, not user input
with open(HTML_TEMPLATE_PATH, "w", encoding="utf-8") as handle:
    handle.write(html_content)
```

**Why it's safe:**

- `HTML_TEMPLATE_PATH` is a **hardcoded module-level constant**:
  ```python
  HTML_TEMPLATE_PATH = "../careverse_regulator/www/compliance_360.html"
  ```
- No user input or dynamic path construction
- Only executed during frontend build process
- Writing hashed asset references to HTML template file

## Security Review Conclusion

All four suppressed findings are **false positives** in the context of build scripts. The Semgrep
rule is correctly identifying file operations, but these particular operations:

1. ✅ Run only at **build time**, not at request time
2. ✅ Use **controlled/hardcoded paths**, not user input
3. ✅ Are part of the **build toolchain**, not application logic
4. ✅ Have **no exposure** to untrusted input

### When NOT to Suppress

Do **not** suppress this rule for:

- Runtime code that processes user requests
- Any `open()` call where the path contains user input
- API endpoints that read files based on request parameters
- Any file access in `api/`, `controllers/`, or request handlers

### Future Additions

If you need to suppress additional Semgrep findings, follow this format:

```python
# nosemgrep: rule-id-here
# Safe: [Clear explanation of why this is safe in this specific context]
```

Always include:

1. The specific rule being suppressed
2. A justification explaining why it's safe
3. Reference to what controls/constraints make it safe

## References

- [Semgrep Suppression Syntax](https://semgrep.dev/docs/ignoring-files-folders-code/)
- [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules)
- [File Traversal Vulnerabilities (OWASP)](https://owasp.org/www-community/attacks/Path_Traversal)
