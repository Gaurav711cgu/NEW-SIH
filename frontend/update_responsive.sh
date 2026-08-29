# OceanState Header
sed -i '' 's/header className="flex items-center justify-between px-2/header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2/g' src/pages/OceanState.tsx

# Biogeochemistry Header
sed -i '' 's/header className="flex items-center justify-between px-2/header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2/g' src/pages/Biogeochemistry.tsx

# MissionControl Header
sed -i '' 's/header className="flex items-center justify-between px-2/header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2/g' src/pages/MissionControl.tsx

# MissionControl Bottom Layout (Depth Gauge + Chart)
sed -i '' 's/<div className="flex gap-4">/<div className="flex flex-col lg:flex-row gap-4">/g' src/pages/MissionControl.tsx
sed -i '' 's/className="w-16 bg-ocean-800\/60/className="w-full lg:w-16 bg-ocean-800\/60/g' src/pages/MissionControl.tsx
sed -i '' 's/w-2 bg-ocean-950 rounded-full/w-full lg:w-2 h-2 lg:h-full bg-ocean-950 rounded-full/g' src/pages/MissionControl.tsx

