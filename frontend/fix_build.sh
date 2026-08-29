# 1. MissionContext.tsx
sed -i '' "s/import { createContext, useContext, useState, useEffect, ReactNode } from 'react';/import { createContext, useContext, useState, useEffect } from 'react';\nimport type { ReactNode } from 'react';/" src/components/layout/MissionContext.tsx

# 2. MissionControl.tsx
# Remove unused imports and missionTrack
sed -i '' '/import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from .recharts.;/d' src/pages/MissionControl.tsx
# Just remove missionTrack definition entirely using perl
perl -i -0pe 's/  \/\/ Simulated static track.*?\}\);\n//s' src/pages/MissionControl.tsx

# 3. OceanState.tsx
sed -i '' 's/import { Droplet, Navigation, Thermometer, Wind, Layers } from .lucide-react.;/import { Navigation, Thermometer, Wind, Layers } from '"'"'lucide-react'"'"';/' src/pages/OceanState.tsx
sed -i '' '/const isBelowMLD = depth > 68;/d' src/pages/OceanState.tsx

# 4. SeafloorIntelligence.tsx
sed -i '' 's/import { motion, AnimatePresence } from .framer-motion.;/import { motion } from '"'"'framer-motion'"'"';/' src/pages/SeafloorIntelligence.tsx
sed -i '' 's/import { Target, Download, Database, Map } from .lucide-react.;/import { Target, Download, Map } from '"'"'lucide-react'"'"';/' src/pages/SeafloorIntelligence.tsx
