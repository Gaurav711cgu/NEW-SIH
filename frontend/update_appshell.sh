# Add import
sed -i '' "s/import { SystemStatusRow } from '.\/SystemStatusRow';/import { SystemStatusRow } from '.\/SystemStatusRow';\nimport { MissionProvider } from '.\/MissionContext';/g" src/components/layout/AppShell.tsx

# Wrap return with MissionProvider
sed -i '' 's/return (/return (\n    <MissionProvider>/g' src/components/layout/AppShell.tsx
sed -i '' 's/    <\/div>\n  );\n}/    <\/div>\n    <\/MissionProvider>\n  );\n}/g' src/components/layout/AppShell.tsx

