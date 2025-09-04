#!/bin/bash

# Component Backup Script
# Usage: ./scripts/backup-component.sh components/SchoolsMap.jsx

if [ $# -eq 0 ]; then
    echo "Usage: $0 <component-file>"
    echo "Example: $0 components/SchoolsMap.jsx"
    exit 1
fi

COMPONENT_FILE="$1"
BACKUP_DIR="backups/components"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/$(basename "$COMPONENT_FILE")_$TIMESTAMP.jsx"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
if [ -f "$COMPONENT_FILE" ]; then
    cp "$COMPONENT_FILE" "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
else
    echo "❌ File not found: $COMPONENT_FILE"
    exit 1
fi

