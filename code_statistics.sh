#!/bin/bash

echo "Total lines of code (excluding generated folders):"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.go" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -name "*.d.ts" \
  -exec cat {} + | wc -l

echo ""
echo "------------------------------------"
echo ""

echo "Bigges files:"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.go" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -name "*.d.ts" \
  -exec wc -l {} + | sort -nr | head -20

echo ""
echo "------------------------------------"

