import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# Fix salinity_ai
content = content.replace(
    "hardwareBOM: 'TDS In-Situ Sensor (₹200) + UNESCO EOS-80 Seawater Formulation',",
    "hardwareBOM: 'Pure Software TEOS-10 Model (Derives from OpenCTD + Temp Input)',"
)
content = content.replace(
    "id: 'salinity_ai',\n    name: 'In-Situ Practical Salinity (UNESCO EOS-80 / TEOS-10)',\n    tier: 'DL_VIRTUAL_REPLICATED',\n    hardwareBOM: 'Pure Software TEOS-10 Model (Derives from OpenCTD + Temp Input)',\n    componentCostINR: 200,",
    "id: 'salinity_ai',\n    name: 'In-Situ Practical Salinity (UNESCO EOS-80 / TEOS-10)',\n    tier: 'DL_VIRTUAL_REPLICATED',\n    hardwareBOM: 'Pure Software TEOS-10 Model (Derives from OpenCTD + Temp Input)',\n    componentCostINR: 0,"
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

