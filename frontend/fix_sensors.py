import re

with open('./src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

# Replace Salinity AI
content = re.sub(
    r"name: 'In-Situ Practical Salinity \(UNESCO EOS-80 \/ TEOS-10\)',\s*tier: '[^']+',\s*hardwareBOM: '[^']+',\s*componentCostINR: 0,",
    "name: 'Hardware Conductivity & Temperature (CT) Sensor',\n    tier: 'INDIGENOUS_PHYSICAL',\n    hardwareBOM: 'Dual Graphite Rods + Precision Thermistor Array',\n    componentCostINR: 1200,",
    content, flags=re.MULTILINE
)

# Replace DO AI
content = re.sub(
    r"name: 'Dissolved Oxygen Marine Telemetry \(Garcia-Gordon Model\)',\s*tier: '[^']+',\s*hardwareBOM: '[^']+',\s*componentCostINR: 0,",
    "name: 'Galvanic Dissolved Oxygen Sensor',\n    tier: 'INDIGENOUS_PHYSICAL',\n    hardwareBOM: 'Subsea Galvanic DO Probe + Analog Signal Conditioner',\n    componentCostINR: 4500,",
    content, flags=re.MULTILINE
)

# Replace Chl AI
content = re.sub(
    r"name: 'Chlorophyll-a Bio-Optical Biomass \(Morel Model\)',\s*tier: '[^']+',\s*hardwareBOM: '[^']+',\s*componentCostINR: 0,",
    "name: 'Fluorescence Chlorophyll-a Biomass Sensor',\n    tier: 'INDIGENOUS_PHYSICAL',\n    hardwareBOM: '470nm LED + Photodiode Optical Chamber',\n    componentCostINR: 3500,",
    content, flags=re.MULTILINE
)

# Replace Salinity Desc
content = re.sub(
    r"desc: 'Real-time thermodynamic calculation combining in-situ electrical conductivity, temperature, and hydrostatic pressure using the international UNESCO EOS-80 standard.',\s*indigenousAdvantage: '[^']+',",
    "desc: 'Physical conductivity cell utilizing graphite electrodes to measure electrical conductivity directly in seawater, enabling highly accurate practical salinity calculation without software hallucination.',\n    indigenousAdvantage: 'Cost: ₹1,200 (Hardware BOM) vs Imported ₹18 Lakhs. 100% physical measurement, zero derived AI data.',",
    content, flags=re.MULTILINE
)

# Replace DO Desc
content = re.sub(
    r"desc: 'Uses the Garcia and Gordon \(1992\) combined mathematical model to estimate dissolved oxygen concentrations based on real-time temperature and salinity vectors without physical membrane biofouling.',\s*indigenousAdvantage: '[^']+',",
    "desc: 'A physical galvanic dissolved oxygen probe that measures the electron transfer from oxygen reduction across a PTFE membrane, providing true in-situ DO levels.',\n    indigenousAdvantage: 'Cost: ₹4,500 (Physical Probe) vs Imported ₹9 Lakhs Optode. Real chemical measurement.',",
    content, flags=re.MULTILINE
)

# Replace Chl Desc
content = re.sub(
    r"desc: 'A bio-optical deep learning edge model estimating phytoplankton biomass by analyzing the ambient downwelling irradiance attenuation \(\(K_d\)\) against physical depth profiles.',\s*indigenousAdvantage: '[^']+',",
    "desc: 'An indigenous physical optical fluorometer. It emits 470nm blue light and physically measures the 680nm red fluorescence emitted by phytoplankton in the water column.',\n    indigenousAdvantage: 'Cost: ₹3,500 (Optical Hardware) vs ₹12 Lakhs imported WET Labs. 100% true physical measurement.',",
    content, flags=re.MULTILINE
)

# Now, we need to completely remove the "2. EDGE-COMPUTED SENSOR FUSION" tab and just have all of them be physical or modular!
# Let's check how tabs are structured.

with open('./src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
