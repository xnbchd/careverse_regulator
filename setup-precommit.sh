#!/bin/bash

# Setup script for pre-commit hooks
# Run from apps/careverse_regulator directory

set -e

echo "================================"
echo "Pre-commit Hooks Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f ".pre-commit-config.yaml" ]; then
    echo "Error: .pre-commit-config.yaml not found"
    echo "Please run this script from the apps/careverse_regulator directory"
    exit 1
fi

# Install pre-commit if not already installed
if ! command -v pre-commit &> /dev/null; then
    echo "Installing pre-commit..."
    pip install pre-commit
else
    echo "✓ pre-commit is already installed"
fi

# Install the git hooks
echo "Installing git hooks..."
pre-commit install

# Install autopep8 for manual formatting (optional)
echo "Installing autopep8 for manual formatting..."
pip install autopep8 || echo "Warning: autopep8 installation failed"

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Pre-commit hooks are now active. They will run automatically on 'git commit'."
echo ""
echo "To run hooks on all files right now:"
echo "  pre-commit run --all-files"
echo ""
echo "To format Python files manually:"
echo "  ruff format careverse_regulator/"
echo "  # OR"
echo "  autopep8 --in-place --aggressive --aggressive -r careverse_regulator/"
echo ""
echo "To format frontend files manually:"
echo "  cd frontend"
echo "  npm run lint"
echo "  npx prettier --write \"src/**/*.{ts,tsx,js,jsx}\""
echo ""
echo "See PRECOMMIT_SETUP.md for more details."
