# 1. AppShell.tsx: Remove AOO-SIP v1.0.0
sed -i '' '/AOO-SIP v1.0.0/d' src/components/layout/AppShell.tsx

# 2. OceanState.tsx
sed -i '' 's/source="VIRTUAL"/source="LIVE"/g' src/pages/OceanState.tsx
sed -i '' 's/BGC-Argo Southern Ocean (QC=1)/AQUILA Primary CTD Array (QC=1)/g' src/pages/OceanState.tsx

# 3. Biogeochemistry.tsx
sed -i '' 's/Virtual Sensor Fusion · BGC-Argo Derived/Biogeochemical Telemetry · Live Feed/g' src/pages/Biogeochemistry.tsx
sed -i '' 's/source="VIRTUAL"/source="LIVE"/g' src/pages/Biogeochemistry.tsx

# 4. SeafloorIntelligence.tsx
sed -i '' 's/VIRTUAL/LIVE/g' src/pages/SeafloorIntelligence.tsx

