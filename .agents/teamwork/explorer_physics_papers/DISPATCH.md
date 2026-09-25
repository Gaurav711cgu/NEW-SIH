## 2026-09-24T22:49:30Z

You are explorer_physics_papers (Role: Meteorological Physics & Research Explorer).
Your Working Directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_physics_papers
Your Parent Conversation ID is: 01fa6723-505c-42d6-9805-8207be998cb5
Project Root: /Users/gauravkumarnayak/Desktop/new sih
Authoritative Request: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md (under timestamp ## 2026-09-24T22:46:09Z)

MISSION:
Conduct deep scientific research on the meteorological physics, mathematical equations, and peer-reviewed literature underpinning ConvectNow (MoES Convective Nowcaster / SIH PS 26084) to establish absolute scientific credibility for SIH judges.

KEY REQUIREMENTS:
1. Examine ConvectNow's codebase (/Users/gauravkumarnayak/Desktop/new sih/convectnow/backend/hazard_engine.py, convectnet.py, physics_explainer.py, nowcaster.py, etc.) to identify all physical formulas, hazard algorithms, and feature attribution models.
2. Compile rigorous mathematical formulations (with full LaTeX equations, parameter definitions, and SI units) for:
   - Radar Reflectivity & Precipitation: Marshall-Palmer (1948) Z-R power law, Indian Monsoon / Tropical Z-R relations (Raghavan 2003, IMD operational Z = 300 R^1.4), and Cloudburst criteria (IMD official definition >=100 mm/hr over 10x10 km, moisture flux, high VIL density >3.5 kg/m^3).
   - Severe Hail Algorithms: Witt et al. (1998) Severe Hail Index (SHI), Temperature-weighted Hail Kinetic Energy Flux (E_dot), Probability of Severe Hail (POSH), Maximum Estimated Size of Hail (MESH), and Waldvogel et al. (1979) 45 dBZ height above freezing level (H45 - H0).
   - Downburst / Microburst Dynamics: Wind Index (WINDEX; McCann 1994), Microburst Windspeed Potential Index (MWPI), Vertically Integrated Liquid (VIL) density, negative thermal buoyancy, and evaporative cooling downdraft velocity.
   - Convective Initiation (CI) & Updraft Dynamics: Mecikalski & Bedka (2006) satellite infrared interest fields (10.8µm cloud-top cooling rate dTb/dt <= -4K/15min, 6.7µm - 10.8µm brightness temperature difference), and updraft core mass flux.
   - Spatiotemporal Advection & Optical Flow: Farnebäck (2003) dense optical flow polynomial expansion, Semi-Lagrangian advection, and ensemble perturbation.
3. Provide at least 4 to 6 real, verifiable peer-reviewed meteorological research papers (Authors, Year, Title, Journal, Volume, Pages, DOI). Explicitly map each paper to the exact file, class, function, or head in ConvectNow's codebase.
4. Explain how ConvectNet's deep learning architecture is physics-informed (loss penalties for physically impossible transitions, physics explainer attributing predictions to VIL density, core height, cooling rate, etc.).

DELIVERABLE:
Write your complete structured research report to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_physics_papers/handoff.md
Follow the standard Handoff format: Observation, Mathematical Formulations, Peer-Reviewed Bibliography & Codebase Mapping, Physics-Informed AI Integration, Caveats, and Conclusion.
When complete, send a message to parent summarizing your findings.
