# Development Best Practices

## File Operations:
- Always use 'write' tool for complete file replacements
- Use 'search_replace' only for small, targeted changes
- Avoid multiple rapid edits to the same file
- Use 'MultiEdit' for multiple changes in one operation

## Caching Strategy:
- Clear caches in this order: .next → node_modules/.cache → .turbo
- Restart server after major file changes
- Use 'pkill -f next dev' to ensure clean shutdown

## File Naming:
- Keep consistent case (SchoolsMap.jsx, not schoolsmap.jsx)
- Use descriptive, stable filenames
- Avoid special characters in filenames

## Development Workflow:
- Make one logical change at a time
- Test after each change
- Keep backups of working versions
- Use git commits for major milestones
