# Pre-commit Hooks Setup

This project uses pre-commit hooks to automatically format and lint code before commits.

## Installation

### 1. Install pre-commit

```bash
pip install pre-commit
```

Or if you're using the bench environment:

```bash
./env/bin/pip install pre-commit
```

### 2. Install the git hooks

From the `apps/careverse_regulator` directory:

```bash
pre-commit install
```

Or with bench environment:

```bash
./env/bin/pre-commit install
```

### 3. (Optional) Run on all files

To run pre-commit on all files (not just changed files):

```bash
pre-commit run --all-files
```

## What the hooks do

### Python files (`.py`)

1. **Trailing whitespace removal** - Removes trailing spaces
2. **Ruff import sorter** - Organizes imports
3. **Ruff linter** - Lints code for errors and style issues
4. **Ruff formatter** - Formats code to consistent style (replaces autopep8/black)

### Frontend files (`.js`, `.jsx`, `.ts`, `.tsx`)

1. **Prettier** - Formats JavaScript/TypeScript files
2. **ESLint** - Lints JavaScript/TypeScript files

### All files

1. **Check merge conflicts** - Ensures no merge conflict markers
2. **Check AST** - Validates Python syntax
3. **Check JSON** - Validates JSON files
4. **Check YAML** - Validates YAML files
5. **Check TOML** - Validates TOML files

## Manual formatting

If you need to format files manually:

### Python

```bash
# Format all Python files
ruff format careverse_regulator/

# Or use autopep8
autopep8 --in-place --aggressive --aggressive -r careverse_regulator/
```

### Frontend

```bash
cd frontend
npm run lint          # Check for issues
npx eslint . --fix    # Auto-fix linting issues
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"  # Format files
```

## Bypassing hooks (not recommended)

If you need to commit without running hooks (emergency only):

```bash
git commit --no-verify -m "your message"
```

## Troubleshooting

### Hooks not running

Make sure they're installed:

```bash
pre-commit install
```

### Hooks failing

Run manually to see detailed errors:

```bash
pre-commit run --all-files
```

### Update hooks

```bash
pre-commit autoupdate
```

## Configuration

The pre-commit configuration is in `.pre-commit-config.yaml`. It includes:

- **ruff v0.14.10** - Fast Python linter and formatter
- **prettier v2.7.1** - Opinionated code formatter for JS/TS
- **eslint v8.44.0** - JavaScript/TypeScript linter

All hooks respect the project's existing configurations:

- `pyproject.toml` or `ruff.toml` for ruff
- `frontend/.prettierrc` for prettier
- `frontend/eslint.config.js` for eslint
