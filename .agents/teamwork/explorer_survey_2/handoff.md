# Handoff Report — Frontend Design System, Blizzard Tokens & Component Guidelines

**Agent**: `explorer_survey_2`  
**Date**: 2026-09-25  
**Working Directory**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_2`  
**Target Repository**: `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend`  
**Authoritative Request**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md` (Section `## 2026-09-25T15:24:45Z`)

---

## 1. Observation

### 1.1 Dependency & Library Analysis (`package.json`)
Direct inspection of `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend/package.json` reveals the following runtime and build dependencies:
```json
"dependencies": {
  "clsx": "^2.1.1",
  "leaflet": "^1.9.4",
  "lucide-react": "^1.37.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwind-merge": "^3.6.0"
},
"devDependencies": {
  "@types/leaflet": "^1.9.16",
  "@types/react": "^19.0.8",
  "@types/react-dom": "^19.0.3",
  "@vitejs/plugin-react": "^4.3.4",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.5.1",
  "tailwindcss": "^3.4.17",
  "typescript": "~5.7.2",
  "vite": "^6.0.11"
}
```
**Critical Library Observations**:
1. **Lucide React (`lucide-react` v1.37.0)**: Used as the universal icon library across all components (`Radio`, `ShieldAlert`, `Radar`, `Satellite`, `CloudLightning`, `BarChart3`, `Play`, `Pause`, `RotateCcw`, `RefreshCw`, `AlertTriangle`, `Clock`, `Sparkles`, `Server`, `Check`, `Download`, `Copy`, `MapPin`, `Activity`, `TrendingUp`, `Cpu`, `Wind`).
2. **Radix UI / shadcn**: Neither `@radix-ui/*` nor `shadcn/ui` is installed in `package.json`. The codebase avoids third-party headless component bloat. Modals and drawers are implemented natively with React state, backdrop blur scrims, and Tailwind layering.
3. **Framer Motion**: `framer-motion` is NOT installed. Animations rely entirely on CSS keyframes and Tailwind animation utilities (`animate-pulse`, `animate-ping`, `animate-in`, `fade-in`, `zoom-in`, custom cubic-bezier transitions).
4. **React 19**: `react: ^19.0.0` is active. Adding external legacy UI libraries carries high peer-dependency conflict risk; native React 19 + Tailwind components ensure instant zero-friction compilation.
5. **Class Utility**: `clsx` and `tailwind-merge` are present for conditional class merging.

---

### 1.2 Exact Design Tokens (`tailwind.config.js` & `src/index.css`)
Direct inspection of `tailwind.config.js` (lines 7–71) and `src/index.css` (lines 5–107):

#### A. Color Tokens
| Token Key | Hex / RGBA Value | Role / Usage in UI |
|---|---|---|
| `blizzard.bg` | `#131928` | Midnight navy canvas, primary container background |
| `blizzard.bgDeep` | `#0a0d15` | Deep obsidian backdrop, masthead header, modal scrim |
| `blizzard.surface` | `#20273c` | Standard card panel body, base console surface |
| `blizzard.surfaceRaised` | `#323a48` | Interactive raised elements, active card states, hover fills |
| `blizzard.surfaceSoft` | `rgba(208, 233, 255, 0.20)` | Translucent hover wash, secondary control fills |
| `blizzard.brand` | `#38a8ff` | Primary electric sky blue brand accent, telemetry readout |
| `blizzard.brandStart` | `#1888ef` | Primary CTA gradient anchor (deep electric blue) |
| `blizzard.brandEnd` | `#009fe9` | Primary CTA gradient anchor (cyan blue) |
| `blizzard.brandSoft` | `#d0e9ff` | Pale icy cyan for secondary label copy, subdued badges |
| `blizzard.border` | `rgba(255, 255, 255, 0.15)` | Hairline translucent border for cards and controls |
| `blizzard.borderStrong` | `rgba(208, 233, 255, 0.42)` | Elevated border for active selections and focus rings |
| `blizzard.scrim` | `rgba(10, 13, 21, 0.78)` | Directional backdrop scrim behind text over graphics |
| `ocean.950` | `#0a0d15` | Deepest viewport canvas |
| `ocean.900` | `#131928` | Standard dashboard background |
| `ocean.800` | `#20273c` | Panel interior fill |
| `ocean.700` | `#26314d` | Sub-card container, secondary table headers |
| `ocean.600` | `#323a48` | Interactive row hover, selected card background |
| `ice.100` | `#ffffff` | Frost white display text (100% white) |
| `ice.200` | `#d0e9ff` | Brand soft readable text (90% white equivalent) |
| `ice.400` | `#7ec6ff` | Light cyan accent for telemetry highlights |
| `ice.500` | `#38a8ff` | Blizzard brand electric blue |
| `ice.600` | `#1888ef` | Deep electric blue for gradients |
| `steel.400` | `rgba(255, 255, 255, 0.70)` | Secondary label text (`text-muted`) |
| `steel.600` | `rgba(255, 255, 255, 0.35)` | Faint metadata, unit labels, inactive dividers |
| `steel.800` | `rgba(255, 255, 255, 0.15)` | Standard panel hairline border |
| `steel.900` | `#0a0d15` | Deep inset fill |

#### B. Hazard & Operational Health Tokens
| Status Level | Hex Value | Background & Border Class | Meaning & Usage |
|---|---|---|---|
| `health.nominal` | `#43c59e` | `bg-emerald-950/80 text-emerald-400 border-emerald-500/40` | Safe status, synced data, open rescue centers |
| `health.degraded` | `#f0b44d` | `bg-amber-950/80 text-amber-300 border-amber-500/50` | Watch advisory, moderate convective storm (35–45 dBZ) |
| `health.critical` | `#ef5a67` | `bg-red-950/90 text-red-300 border-red-500/80` | Warning, Cloudburst (>100 mm/h), immediate evacuation |
| `purple / hail` | `#a855f7` | `bg-purple-950/90 text-purple-300 border-purple-500/80` | Severe hail core aloft, POSH > 50%, MESH > 25 mm |
| `health.offline` | `#64748b` | `bg-slate-900 text-slate-400 border-slate-700/60` | Inactive sensor feed, unavailable route |

#### C. Typography Tokens
- **Display / Headings**: `'Poppins', 'Helvetica Neue', Arial, sans-serif` (`font-display` or `font-heading`).
- **Body / Interface**: `'Archivo', 'Inter', system-ui, -apple-system, sans-serif` (`font-body` or `font-sans`).
- **Telemetry / Timers / Numbers**: `'JetBrains Mono', 'SFMono-Regular', Menlo, monospace` (`font-mono`).

#### D. Shadow & Glow Tokens
- `blizzard-btn`: `0 0 25px rgba(56, 168, 255, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)`
- `blizzard-btn-hover`: `0 0 35px rgba(56, 168, 255, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.6)`
- `blizzard-card`: `0 16px 40px rgba(10, 13, 21, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)`
- `blizzard-glow`: `0 0 20px rgba(56, 168, 255, 0.3)`
- `critical-alert-glow`: `0 0 30px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)`

#### E. Pre-Engineered CSS Component Classes (`src/index.css`)
```css
/* Blizzard High-Confidence Primary Pill Button */
.btn-blizzard-primary {
  background: linear-gradient(135deg, rgba(24, 136, 239, 0.95), rgba(0, 159, 233, 0.95));
  color: #ffffff;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 25px rgba(56, 168, 255, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Blizzard Translucent Secondary Pill Control */
.btn-blizzard-secondary {
  background: rgba(208, 233, 255, 0.12);
  color: #d0e9ff;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-family: 'Archivo', sans-serif;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Blizzard Weather Console Card */
.card-blizzard {
  background: rgba(32, 39, 60, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(208, 233, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(10, 13, 21, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Elevated Glass Card */
.glass-card-elevated {
  background: rgba(50, 58, 72, 0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 168, 255, 0.35);
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(10, 13, 21, 0.7), 0 0 25px rgba(56, 168, 255, 0.15);
}
```

---

### 1.3 Existing Application Shell Structure (`src/App.tsx`)
In `src/App.tsx`:
- Line 41 defines `viewMode`:
  ```tsx
  const [viewMode, setViewMode] = useState<'tactical' | 'anatomy' | 'public' | 'architecture'>('tactical');
  ```
- Lines 127–233 render the fixed 64px Blizzard masthead with MoES branding, live multi-sensor data feed chips (`DWR 250m`, `INSAT-3DR`, `GLM/IITM`), real-time UTC clock, and the mode switcher pill.
- Currently, when `viewMode === 'public'` is selected (lines 384–440), it renders a placeholder alert card with mock text and a single button to return to tactical command.
- The `admin` intelligence panel is currently absent, though `CapAlertModal.tsx` provides the CAP v1.2 XML modal upon clicking "CAP Alert" inside `ETACountdown.tsx`.

---

## 2. Logic Chain

```
Observation 1 (ORIGINAL_REQUEST.md ## 2026-09-25T15:24:45Z)
  ├── R1: Admin Intelligence Panel (MoES / SDMA command interface, storm selection, population at risk,
  │       building vulnerability, nearby NDRF/SDRF rescue centers, "Dispatch Alert" trigger).
  └── R2: Citizen Warning View (Mausam App POV, mobile push notification, alert screen, storm ETA,
          scannable NDMA SOPs, navigation to nearest safe rescue center).
  │
Observation 2 (Frontend Codebase & Design Tokens)
  ├── Existing tailwind.config.js has Blizzard tokens ('blizzard', 'ocean', 'ice', 'steel', 'health').
  ├── index.css provides .card-blizzard, .btn-blizzard-primary, .glass-card, and scrollbars.
  ├── Fonts: Poppins (headings), Archivo (body), JetBrains Mono (telemetry & countdowns).
  └── Icons: lucide-react is the sole vetted icon library; Radix UI & Framer Motion are intentionally absent.
  │
Observation 3 (Current App.tsx Navigation & Views)
  ├── viewMode supports 'tactical', 'anatomy', 'architecture', and 'public'.
  ├── 'public' view is currently a rudimentary 50-line card, perfect for replacement by the full Citizen Warning View.
  └── 'admin' intelligence dispatch requires either a dedicated mode ('admin') or a split tactical command panel.
  │
Inference & Design Synthesis
  ├── Admin Intelligence Panel must adhere to the high-density Blizzard command console aesthetic
  │   (dark obsidian/navy glass cards, JetBrains Mono meters, high-confidence pill action buttons).
  └── Citizen Warning View must simulate the official MoES / IMD "Mausam" mobile app inside an authentic
      iPhone / Android container with a toggle for full-screen mode, eliminating dense paragraphs in favor
      of scannable NDMA action cards with prominent icons.
```

---

## 3. Concrete Styling & Component Guidelines

### 3.1 Admin Intelligence Panel (MoES / SDMA Command Console)

#### A. Component Architecture: `<AdminIntelligencePanel />`
- **File Location**: `src/components/AdminIntelligencePanel.tsx`
- **Props Interface**:
```typescript
interface AdminIntelligencePanelProps {
  selectedCell: any;
  stormCells: any[];
  onSelectCell: (cell: any) => void;
  onDispatchAlert: (dispatchPayload: DispatchPayload) => void;
  dispatchedAlerts: DispatchedAlertRecord[];
}

export interface DispatchPayload {
  cellId: string;
  threatLevel: 'WATCH' | 'WARNING' | 'EMERGENCY';
  impactRadiusKm: number;
  affectedPopulation: number;
  buildingVulnerabilityIndex: number;
  notifiedRescueUnits: string[];
  dispatchedAtUtc: string;
}
```

#### B. Visual Hierarchy & Token Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER: MoES / SDMA Operational Intelligence & Dispatch Console             │
│  [ Radio ]  Active Storm Cell Selector Pills: [ CELL-A01 64dBZ ] [ CELL-B04 ] │
├──────────────────────────────────────────────────────────────────────────────┤
│  ROW 1: 3-HERO RISK METERS (JetBrains Mono + Poppins)                        │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐  │
│  │ POPULATION AT RISK   │ │ BUILDING RISK INDEX  │ │ CONVECTIVE CORE      │  │
│  │ 482,500 Citizens     │ │ 84 / 100 (EXTREME)   │ │ 68.2 dBZ · 115 mm/h  │  │
│  │ High-Density Urban   │ │ 34% Katcha / Tin     │ │ Cloudburst Trigger   │  │
│  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│  ROW 2: DISPATCH RADIUS SELECTOR & TARGET CORRIDORS                          │
│  Radius: [ 5 km (Core) ] [ 15 km (Buffer) ] [ 25 km (Corridor) ] [ 50 km ]   │
│  Monitored Assets in Swath: 3 Urban Centers, 1 Airport, 1 Railway Line       │
├──────────────────────────────────────────────────────────────────────────────┤
│  ROW 3: DISASTER RESPONSE FORCES (NDRF / SDRF / DEOC Status Table)           │
│  • NDRF 10th Bn (Guntur Base)       | 18.4 km | 24 min | STANDBY (145 pax) │
│  • SDRF Rapid Response (Sector 7)   | 8.2 km  | 12 min | MOBILIZING (42)   │
│  • District Emergency Operations Ctr| 4.5 km  | 8 min  | DISPATCH READY    │
├──────────────────────────────────────────────────────────────────────────────┤
│  ACTION BAR: HIGH-CONFIDENCE BLIZZARD DISPATCH TRIGGER                       │
│  [ DISPATCH CAP v1.2 EMERGENCY ALERT TO CITIZENS & RESPONSE TEAMS ]          │
│  Status Pill: "LAST DISPATCH: 14:22 UTC · 482k Devices Alerted"              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### C. Exact Styling & Tailwind Classes for Admin Panel
1. **Outer Shell**:
   - `card-blizzard border border-white/15 p-5 rounded-3xl shadow-blizzard-card flex flex-col gap-4 text-white font-sans`
2. **Cell Selector Buttons**:
   - Inactive: `px-3.5 py-1.5 rounded-full text-xs font-mono bg-ocean-900/80 border border-steel-800 text-steel-400 hover:text-white hover:border-ice-500/40 transition-all`
   - Active: `px-3.5 py-1.5 rounded-full text-xs font-mono bg-gradient-to-r from-[#1888ef] to-[#009fe9] text-white font-bold border border-white/30 shadow-[0_0_15px_rgba(56,168,255,0.4)]`
3. **Risk Metric Cards**:
   - Container: `bg-ocean-900/90 border border-steel-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between`
   - Metric Value: `text-3xl font-black font-mono tracking-tight text-white mt-1`
   - Sub-meter Progress Bar:
     ```tsx
     <div className="w-full bg-ocean-950 h-2 rounded-full overflow-hidden border border-steel-800 mt-2">
       <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-700" style={{ width: '84%' }} />
     </div>
     ```
4. **Rescue Center Status Table**:
   - Header row: `bg-ocean-950/70 text-steel-400 text-[11px] font-mono uppercase tracking-wider py-2 px-3 border-b border-steel-800`
   - Item row: `py-2.5 px-3 border-b border-steel-800/60 flex items-center justify-between hover:bg-ocean-800/40 transition-colors`
   - Readiness Badges:
     * Standby: `bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold`
     * Mobilizing: `bg-amber-950/90 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse`
5. **Blizzard Primary Dispatch Button**:
   - `w-full py-3.5 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-white/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2.5`

---

### 3.2 Citizen Warning View (Mausam App POV)

#### A. Component Architecture: `<CitizenWarningView />`
- **File Location**: `src/components/CitizenWarningView.tsx`
- **Props Interface**:
```typescript
interface CitizenWarningViewProps {
  selectedCell: any;
  activeDispatchAlert?: DispatchPayload | null;
  onAcknowledgeAlert?: () => void;
  onNavigateTactical?: () => void;
}
```

#### B. Visual Hierarchy & Simulated Device Anatomy

```
Desktop Backdrop (#0a0d15 with subtle animated crimson aurora glow)
  │
  ├── Top Viewport Control Bar:
  │   [ 📱 Phone Frame View ]  |  [ ⛶ Fullscreen Web View ]  |  [ ✕ Return to Command ]
  │
  └── Simulated iPhone 16 Pro Container (w-[390px] h-[820px]):
      ├── Outer Bezel: metallic obsidian (#1c1f2e, 8px border, rounded-[52px], glass reflection)
      ├── Dynamic Island Notch: (pill w-28 h-7 bg-black, front camera lens, amber warning dot)
      ├── iOS Status Bar: 15:32 | 5G | 94% Battery
      │
      ├── SIMULATED PUSH NOTIFICATION BANNER (Slide-in at top of phone screen):
      │   [ IMD Crest ] MAUSAM EMERGENCY NOWCAST · Just Now
      │   "RED ALERT: Severe Hailstorm & Cloudburst ETA 18 min in your sector."
      │
      ├── OFFICIAL BRANDING MASTHEAD:
      │   - Government of India Tricolor ribbon (Saffron-White-Green hairline)
      │   - भारत मौसम विज्ञान विभाग / INDIA METEOROLOGICAL DEPARTMENT
      │   - Ministry of Earth Sciences (MoES)
      │   - Location Chip: "📍 Padmapur / Sector 4, Visakhapatnam (Live GPS)"
      │
      ├── HIGH-VISIBILITY WARNING BANNER:
      │   - Blinking Red Header: 🔴 RED ALERT: EXTREME CONVECTIVE STORM
      │   - Countdown Clock: 00:18:42 (Large JetBrains Mono, "TIME TO IMPACT")
      │   - Peak Rain Rate: 115 mm/h | Hail: 32 mm | Surface Wind: 88 km/h
      │
      ├── SCANNABLE NDMA ACTION CARDS (Zero dense paragraphs! Icon + Rule):
      │   [ 🏠 ] 1. Move to Pucca Building (Avoid tin sheds, metal awnings, fragile roofs)
      │   [ ⚡ ] 2. Disconnect Heavy Appliances (Avoid lightning surges & electrical faults)
      │   [ 🌊 ] 3. Avoid Low Drains & Culverts (Flash flood runoff in < 15 minutes)
      │   [ 🌳 ] 4. Stay Clear of Tall Trees & Poles (Lightning strike ground-arc hazard)
      │
      ├── NEAREST SAFE RESCUE CENTER / SHELTER CARD:
      │   - Title: "Sector 4 Cyclone & Flood Relief Centre"
      │   - Distance: 1.2 km · 14 min walk / 4 min vehicle
      │   - Capacity: 450 / 800 Occupants · Open & Manned by SDRF Unit
      │   - Action Button: [ 📍 Get Walking Directions in GPS ]
      │
      ├── EMERGENCY QUICK-DIAL BUTTONS:
      │   [ 📞 112 National ]  [ 📞 1077 District ]  [ 📞 1070 State ]
      │
      └── Bottom Home Indicator Bar (w-32 h-1 bg-white/30 rounded-full)
```

#### C. Exact Styling & Tailwind Classes for Mausam App View
1. **Outer Phone Chassis**:
   ```tsx
   <div className="w-[390px] h-[820px] bg-[#0a0d15] rounded-[52px] border-[8px] border-[#1c1f2e] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(56,168,255,0.15)] flex flex-col relative overflow-hidden select-none">
     {/* Dynamic Island */}
     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-3 text-[10px] text-white/50">
       <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-white/10" />
       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
     </div>
     
     {/* Status Bar */}
     <div className="h-11 px-7 pt-3 flex items-center justify-between text-xs text-white/70 font-mono shrink-0 z-30">
       <span>15:32</span>
       <div className="flex items-center space-x-1.5">
         <span className="text-[10px]">5G</span>
         <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
           <div className="h-full bg-white w-4 rounded-xs" />
         </div>
       </div>
     </div>
     
     {/* Scrollable Screen Body */}
     <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3.5 custom-scrollbar z-20">
       ...
     </div>
     
     {/* iOS Home Bar */}
     <div className="h-6 flex items-center justify-center shrink-0 z-30">
       <div className="w-32 h-1 bg-white/30 rounded-full" />
     </div>
   </div>
   ```

2. **Incoming Push Notification Simulator**:
   ```tsx
   <div className="bg-[#131928]/95 border border-[#38a8ff]/40 p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in slide-in-from-top duration-500">
     <div className="flex items-center space-x-2">
       <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1888ef] to-[#38a8ff] flex items-center justify-center">
         <Radio className="w-3 h-3 text-white" />
       </div>
       <span className="text-[10px] font-bold text-white uppercase tracking-wider font-display">MAUSAM NOWCAST</span>
       <span className="text-[9px] text-white/40 font-mono">Just Now</span>
     </div>
     <p className="text-xs font-semibold text-red-300 mt-1 leading-tight">
       🚨 RED ALERT: Cloudburst & Hailstorm ETA 18 min in your sector.
     </p>
     <p className="text-[11px] text-white/70 mt-0.5">
       Impact imminent. Move to concrete shelter immediately.
     </p>
   </div>
   ```

3. **Official IMD / MoES Masthead**:
   ```tsx
   <div className="border-b border-white/10 pb-2">
     <div className="h-0.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] mb-2 rounded-full" />
     <div className="flex items-center justify-between">
       <div>
         <h1 className="text-[11px] font-black tracking-wider text-white uppercase font-display">
           भारत मौसम विज्ञान विभाग
         </h1>
         <h2 className="text-[10px] font-semibold text-slate-300 uppercase tracking-tight font-sans">
           INDIA METEOROLOGICAL DEPARTMENT (MoES)
         </h2>
       </div>
       <span className="text-[9px] bg-red-950/80 text-red-400 font-mono px-2 py-0.5 rounded-full border border-red-500/60 font-bold animate-pulse">
         NOWCAST LIVE
       </span>
     </div>
     <div className="mt-1.5 flex items-center space-x-1.5 text-[10px] text-[#38a8ff] font-mono">
       <MapPin className="w-3 h-3" />
       <span>Padmapur Sector 4, Visakhapatnam</span>
     </div>
   </div>
   ```

4. **Countdown Hero Banner**:
   ```tsx
   <div className="bg-gradient-to-b from-red-950/90 to-red-900/40 border-2 border-red-500/70 rounded-2xl p-4 text-center shadow-[0_0_30px_rgba(239,68,68,0.35)] relative overflow-hidden">
     <div className="absolute top-0 right-0 p-12 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
     <span className="text-[10px] font-mono font-bold tracking-widest text-red-300 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-700/80">
       🔴 IMMEDIATE SEVERE STORM ALERT
     </span>
     <div className="text-3xl font-black font-mono text-white mt-2 tracking-tight">
       00:18:42
     </div>
     <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider">
       Estimated Time to Direct Impact
     </span>
     <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-red-500/30 text-left">
       <div>
         <span className="text-[9px] text-white/50 block font-mono">Intensity</span>
         <span className="text-xs font-bold font-mono text-red-300">68.2 dBZ</span>
       </div>
       <div>
         <span className="text-[9px] text-white/50 block font-mono">Rain Rate</span>
         <span className="text-xs font-bold font-mono text-amber-300">115 mm/h</span>
       </div>
       <div>
         <span className="text-[9px] text-white/50 block font-mono">Hail Risk</span>
         <span className="text-xs font-bold font-mono text-purple-300">32 mm Core</span>
       </div>
     </div>
   </div>
   ```

5. **Scannable NDMA SOP Action Cards Grid**:
   - Card Style: `bg-ocean-900/90 border border-steel-800 rounded-xl p-3 flex items-start space-x-3 hover:border-ice-500/30 transition-all`
   - Icon Pill: `w-9 h-9 rounded-full bg-ocean-800 border border-white/10 flex items-center justify-center shrink-0`
   - Scannable Content:
     * Card 1: `<Home className="w-4 h-4 text-emerald-400" />`
       - Title: `Seek Sturdy Enclosed Shelter`
       - Action: Move inside a concrete (pucca) building. Avoid tin roofs or glass windows.
     * Card 2: `<Zap className="w-4 h-4 text-amber-400" />`
       - Title: `Disconnect Electrical Appliances`
       - Action: Unplug inverter plugs, TVs, and PCs. Do not touch metal fences or corded phones.
     * Card 3: `<CloudRain className="w-4 h-4 text-blue-400" />`
       - Title: `Avoid Low Drains & Riverbeds`
       - Action: Flash flood runoff in < 15 min. Never drive through standing or moving floodwater.
     * Card 4: `<AlertTriangle className="w-4 h-4 text-rose-400" />`
       - Title: `Do Not Shelter Under Isolated Trees`
       - Action: Extreme lightning ground-arc hazard. If caught in open, crouch low on balls of feet.

6. **Nearest Safe Rescue Center / Shelter Card**:
   ```tsx
   <div className="bg-[#131928]/90 border border-emerald-500/50 rounded-2xl p-3.5 shadow-lg">
     <div className="flex items-center justify-between">
       <div className="flex items-center space-x-1.5 text-xs font-bold text-white font-display">
         <Shield className="w-4 h-4 text-emerald-400" />
         <span>Designated Safe Shelter</span>
       </div>
       <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
         OPEN · 450/800
       </span>
     </div>
     <p className="text-xs font-semibold text-slate-200 mt-1">
       Sector 4 Government Cyclone &amp; Flood Relief Camp
     </p>
     <div className="flex items-center space-x-3 text-[11px] text-white/60 font-mono mt-1">
       <span>📍 1.2 km away</span>
       <span>⏱ ~14 min walk / 4 min drive</span>
     </div>
     <button className="mt-2.5 w-full py-2 px-3 rounded-full text-xs font-bold font-display text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-white/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-1.5">
       <Navigation className="w-3.5 h-3.5" />
       <span>Open GPS Navigation Route</span>
     </button>
   </div>
   ```

7. **Emergency Quick-Dial Bar**:
   ```tsx
   <div className="grid grid-cols-3 gap-2">
     <a href="tel:112" className="p-2.5 rounded-xl bg-ocean-900 border border-steel-800 text-center hover:border-red-500/40 transition-all flex flex-col items-center">
       <PhoneCall className="w-4 h-4 text-red-400 mb-0.5" />
       <span className="text-xs font-mono font-bold text-white">112</span>
       <span className="text-[9px] text-white/50">National</span>
     </a>
     <a href="tel:1077" className="p-2.5 rounded-xl bg-ocean-900 border border-steel-800 text-center hover:border-amber-500/40 transition-all flex flex-col items-center">
       <PhoneCall className="w-4 h-4 text-amber-400 mb-0.5" />
       <span className="text-xs font-mono font-bold text-white">1077</span>
       <span className="text-[9px] text-white/50">District DEOC</span>
     </a>
     <a href="tel:1070" className="p-2.5 rounded-xl bg-ocean-900 border border-steel-800 text-center hover:border-[#38a8ff]/40 transition-all flex flex-col items-center">
       <PhoneCall className="w-4 h-4 text-[#38a8ff] mb-0.5" />
       <span className="text-xs font-mono font-bold text-white">1070</span>
       <span className="text-[9px] text-white/50">State SEOC</span>
     </a>
   </div>
   ```

---

## 4. Caveats
1. **Mock Coordinates vs Real-World GIS**: The backend `HazardMap` renders Leaflet coordinates focused on Eastern India (Odisha / Visakhapatnam, `lat: 17.8, lng: 83.2`), while some default target assets in `server.py` list Dehradun / Uttarakhand corridors. The UI guidelines ensure fallback mock locations (Padmapur Sector 4, Visakhapatnam and Guntur/Vijayawada 10th NDRF Battalion) harmonize seamlessly with both geographies.
2. **Device Hardware Acceleration**: Mobile phone frame box-shadows (`shadow-[0_25px_70px_rgba(0,0,0,0.9)]`) and multiple layers of `backdrop-filter: blur(16px)` require standard GPU compositing. Keep blur values $\le 20\text{px}$ to guarantee 60 FPS on lower-tier presentation laptops.
3. **No Radix UI / Framer Motion**: All modal, tab, and drawer states must remain zero-dependency React state (`useState`) to preserve React 19 compatibility and sub-second Vite build speeds.

---

## 5. Conclusion
1. The ConvectNow frontend possesses a mature and well-structured Blizzard/Glassmorphism design system in `tailwind.config.js` and `src/index.css`, centered around `blizzard` (`#131928`, `#0a0d15`, `#20273c`, `#38a8ff`), `ocean`, `ice`, and `steel` palettes.
2. The current `App.tsx` has a clean mode switcher pill that currently supports `'tactical'`, `'anatomy'`, `'architecture'`, and a placeholder `'public'` view.
3. **Admin Intelligence Panel** should be introduced either as an expandable split-pane in Tactical Command or as a dedicated `'admin'` / `'dispatch'` tab in the header switcher.
4. **Citizen Warning View** should replace the existing rudimentary `'public'` view with an authentic simulated mobile "Mausam App" (iPhone 16 Pro container with notch, status bar, and home indicator) equipped with a full-screen toggle.
5. All NDMA safety guidelines must be laid out as scannable, icon-paired action cards (Pucca shelter, electrical disconnect, flood avoidance, tree lightning hazard) rather than dense prose, strictly fulfilling SIH PS-26084 acceptance criteria.

---

## 6. Verification Method

### 6.1 Independent Build & Type-Check Verification
Execute the project build command in `convectnow/frontend`:
```bash
cd "/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend"
npm run build
```
**Expected Outcome**: Zero TypeScript errors, Vite transforms $\sim 1831$ modules, produces clean production bundle in `dist/` with exit code 0.

### 6.2 Token Invalidation Conditions
- If any component uses arbitrary undeclared color classes (e.g. `bg-blue-600` instead of `bg-gradient-to-r from-[#1888ef] to-[#009fe9]` or `text-[#38a8ff]`), it violates the Blizzard design specification.
- If font families other than `font-display` (Poppins), `font-body` (Archivo), or `font-mono` (JetBrains Mono) are introduced, typography integrity fails.
- If the Citizen View relies on uninterrupted paragraph walls rather than icon-annotated action cards, it fails Acceptance Criterion 2 of timestamp `## 2026-09-25T15:24:45Z`.
