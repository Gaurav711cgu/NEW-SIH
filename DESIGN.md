# DESIGN.md — Autonomous Ocean Observation and Seafloor Intelligence Platform
**Version:** 1.0.0 · **Audience:** AI Coding Agents, Frontend Engineers, Design Contributors
**Project Classification:** Operational Scientific Dashboard · **Access Level:** Domain Expert Users (MoES / NCPOR / NIOT)

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Theme Identity — "Ice and Ships"](#2-theme-identity--ice-and-ships)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Grid](#5-spacing--grid)
6. [Materiality — Glassmorphism Protocol](#6-materiality--glassmorphism-protocol)
7. [Component Library](#7-component-library)
8. [Data Provenance Badges](#8-data-provenance-badges)
9. [Graceful Degradation System](#9-graceful-degradation-system)
10. [Layout Architecture](#10-layout-architecture)
11. [Page Specifications](#11-page-specifications)
12. [Data Visualization Guidelines](#12-data-visualization-guidelines)
13. [Motion & Animation](#13-motion--animation)
14. [Accessibility Requirements](#14-accessibility-requirements)
15. [Tailwind Configuration Reference](#15-tailwind-configuration-reference)

---

## 1. Design Philosophy

### 1.1 Core Mandate
This platform is a mission-critical scientific instrument, not a marketing dashboard. Every design decision must serve one goal: enabling oceanographers, marine scientists, and policy officers to make fast, confident, evidence-based decisions in remote operational environments — often under high cognitive load, degraded connectivity, and time pressure.

The design is successful when a domain expert can identify an anomalous sensor reading, verify its provenance, and act on it within 8 seconds of screen load.

### 1.2 Three Governing Principles

#### ① Operational Clarity over Visual Novelty
The interface exists to surface ground truth, not to impress. No decorative element may compete with data for visual priority. No animation may delay data comprehension. No aesthetic choice may introduce ambiguity about what is real versus simulated.

*In practice:* Favour whitespace and typographic hierarchy over gradients and micro-illustrations. Every component must have a clear visual purpose expressible in one sentence.

#### ② Strict Data Provenance
Scientific misrepresentation is a design failure. Any parameter displayed without a source label is a bug, not a feature gap. The UI must make it impossible to confuse LIVE telemetry with VIRTUAL sensor fusion, DATASET replay, or PLANNED trajectory data.

*In practice:* Data provenance badges are non-negotiable, non-hideable, and rendered before the metric value in the DOM. See [§8 — Data Provenance Badges](#8-data-provenance-badges).

#### ③ Graceful Degradation
The Southern Ocean is hostile to continuous connectivity. Signal dropouts, MQTT broker disconnects, and acoustic shadow zones are expected operational states, not error conditions. The UI must communicate these states with precision and calm — informing the operator without alarming them unnecessarily.

*In practice:* Every data-dependent component must have a defined DROPOUT visual state. See [§9 — Graceful Degradation System](#9-graceful-degradation-system).

### 1.3 Anti-Patterns Banned from This Codebase

| ❌ Banned Pattern | Reason |
| --- | --- |
| Unlabelled data metrics | Scientific misrepresentation |
| Full-page loading spinners | Blocks situation awareness; use skeleton states |
| Red/green as sole status indicators | WCAG failure; colour-blind users lose critical signal |
| Auto-playing video or animation on load | Distracts from telemetry |
| Modals that open from modals | Breaks operator focus flow |
| `outline: none` without custom focus style | Keyboard navigation failure |
| Hover-only tooltips for critical data | Inaccessible on touch; unavailable when hands are full |
| Font sizes below 14px for any data value | Unreadable at operational viewing distance |

---

## 2. Theme Identity — "Ice and Ships"

### 2.1 Concept
The aesthetic emerges from the physical reality of Southern Ocean operations: the visual tension between the dark, pressurised abyss and the brittle, luminous ice shelf above it. Steel-hulled research vessels — NIOT's Sindhu Sadhana, Sagar Nidhi — are the only human presence in this environment.

- **Visual metaphor:** Looking up through a porthole at pack ice, lit from below by instruments.
- **Background:** Deep ocean photography crossfaded via Framer Motion. Near-black with blue-green undertones.
- **Surface:** Frosted glass panels — rendered with `backdrop-blur-md` — simulate the ice effect over dark water.
- **Accent:** Electric cyan (`#00e5ff`) represents active, live telemetry — the colour of bioluminescence and active sonar pings.
- **Warning:** Amber-orange for degraded states; never pure red as a lone indicator.
- **Typography:** Industrial precision. Monospace for all numbers and coordinates; sans-serif for labels and prose.

### 2.2 Emotional Tone

| State | Tone | Design Response |
| --- | --- | --- |
| All systems nominal | Calm authority | Muted palette, steady cyan accents |
| Degraded signal | Heightened attention | Amber pulse, warning badge |
| Total dropout | Controlled urgency | Striped pattern, static badge, no panic |
| Mission complete | Quiet satisfaction | No celebration animation; clear status text |

---

## 3. Color System

### 3.1 Primitive Tokens
All colours are defined as CSS custom properties and mirrored in `tailwind.config.js`. **AI agents: use the Tailwind class names, not raw hex values in JSX.**

**Ocean Scale — Background & Depth**
```css
--ocean-950: #020b14; /* Deepest abyss — page background, maximum depth */
--ocean-900: #041527; /* Deep water — sidebar background */
--ocean-800: #0a2540; /* Mesopelagic — card base colour */
--ocean-700: #144272; /* Epipelagic — active card, elevated surface */
--ocean-600: #1a5276; /* Near-surface — interactive hover state */
```
Tailwind classes: `bg-ocean-950`, `bg-ocean-900`, `bg-ocean-800`, `bg-ocean-700`, `bg-ocean-600`

**Ice Scale — Foreground & Accent**
```css
--ice-100: #e0f7fa; /* Frost white — primary body text */
--ice-200: #b2ebf2; /* Meltwater — secondary labels, descriptions */
--ice-400: #4dd0e1; /* Slush — tertiary labels, disabled states */
--ice-500: #00e5ff; /* Active cyan — LIVE badge, accent, focus rings */
--ice-600: #00b8d4; /* Deep cyan — hover state for cyan elements */
```
Tailwind classes: `text-ice-100`, `text-ice-200`, `text-ice-400`, `text-ice-500`, `border-ice-500`

**Steel Scale — Structural Elements**
```css
--steel-400: #94a3b8; /* Light steel — icon fill, chart gridlines */
--steel-600: #475569; /* Mid steel — dividers, subtle borders */
--steel-800: #1e293b; /* Dark steel — card border, input border */
--steel-900: #0f172a; /* Deep steel — tooltip background */
```
Tailwind classes: `text-steel-400`, `border-steel-800`, `bg-steel-900`

### 3.2 Semantic Tokens
These map to operational states. **Always use semantic tokens for status colours — never use primitive tokens for status.**

```css
/* Data Provenance */
--status-live: #00e5ff; /* Ice-500 — real-time telemetry */
--status-virtual: #a78bfa; /* Purple-400 — sensor fusion / modelled */
--status-dataset: #34d399; /* Emerald-400 — replay / historical */
--status-planned: #fb923c; /* Orange-400 — mission plan / predicted */

/* System Health */
--health-nominal: #22c55e; /* Green-500 */
--health-degraded: #f59e0b; /* Amber-500 */
--health-critical: #ef4444; /* Red-500 — ALWAYS paired with icon + text */
--health-offline: #64748b; /* Steel-500 */

/* Alert Levels */
--alert-info: #38bdf8; /* Sky-400 */
--alert-warning: #fbbf24; /* Amber-400 */
--alert-error: #f87171; /* Red-400 */
--alert-dropout: #94a3b8; /* Steel-400 — signal loss is calm, not critical */
```

### 3.3 Background Layering System
The UI uses a consistent depth model. Higher z-index = lighter background opacity.

| Level | Class | Use Case |
| --- | --- | --- |
| `z-0` | `bg-ocean-950` | Page canvas (darkest) |
| `z-10` | `bg-ocean-900/80` | Sidebar |
| `z-20` | `bg-ocean-800/60` | Glass cards (`backdrop-blur-md`) |
| `z-30` | `bg-ocean-700/50` | Elevated panels, active states |
| `z-40` | `bg-steel-900/95` | Tooltips, dropdowns |
| `z-50` | `bg-ocean-900/90` | Modals, overlays |

---

## 4. Typography

### 4.1 Font Stack
```css
/* Sans-serif — Labels, navigation, prose, UI copy */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace — ALL numerical data, coordinates, system IDs, status codes */
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### 4.2 Type Scale
| Token | Size | Weight | Line Height | Font | Use Case |
| --- | --- | --- | --- | --- | --- |
| `display-xl` | 32px / 2rem | 700 | 1.1 | Inter | Page titles |
| `display-lg` | 24px / 1.5rem | 600 | 1.2 | Inter | Section headers |
| `display-md` | 20px / 1.25rem | 600 | 1.3 | Inter | Card titles |
| `body-lg` | 16px / 1rem | 400 | 1.5 | Inter | Primary body text |
| `body-md` | 14px / 0.875rem | 400 | 1.5 | Inter | Secondary labels |
| `body-sm` | 12px / 0.75rem | 500 | 1.4 | Inter | Badges, captions |
| `data-xl` | 36px / 2.25rem | 700 | 1.0 | JetBrains Mono | Primary metric values |
| `data-lg` | 24px / 1.5rem | 600 | 1.0 | JetBrains Mono | Secondary metrics |
| `data-md` | 16px / 1rem | 500 | 1.0 | JetBrains Mono | Inline data, coordinates |
| `data-sm` | 12px / 0.75rem | 400 | 1.0 | JetBrains Mono | Timestamps, IDs |

### 4.3 Typography Rules
- **Rule 1:** Every numerical value displayed in the UI must use `font-mono` (`JetBrains Mono`). No exceptions. This includes depth readings, pH values, coordinates, timestamps, confidence scores, and packet counts.
- **Rule 2:** Metric labels (the text above or below a data value) use `font-sans`, `text-steel-400`, `text-xs`, uppercase, `tracking-wider`. This creates immediate visual hierarchy between "what the thing is" and "what the thing measures."
- **Rule 3:** Minimum readable body text: 14px. Never render informational text below this size.
- **Rule 4:** Coordinates always render in E / W / N / S format with degree symbol. Example: `63°18′S 57°54′W`.
- **Rule 5:** Timestamps are always UTC. Never render local time without an explicit `UTC+X` suffix. Prefer ISO 8601 format in data readouts.

---

## 5. Spacing & Grid

### 5.1 Base Unit
All spacing uses an **8px base grid**. Tailwind's default spacing scale aligns with this (`p-2` = 8px, `p-4` = 16px, etc.).
- 4px (`p-1`) — Icon internal padding
- 8px (`p-2`) — Badge padding, tight lists
- 12px (`p-3`) — Compact card padding
- 16px (`p-4`) — Standard card padding
- 24px (`p-6`) — Section internal padding
- 32px (`p-8`) — Between card groups
- 48px (`p-12`) — Between page sections
- 64px (`p-16`) — Page-level vertical rhythm

### 5.2 Layout Grid
| Zone | Width | Notes |
| --- | --- | --- |
| Sidebar | 240px fixed | Collapses to 64px icon-only on narrow displays |
| Main content | `calc(100vw - 240px)` | Full height scroll |
| Content max-width | 1440px | Centred on ultra-wide displays |
| Card grid gutter | 16px (`gap-4`) | Between metric cards |
| Section gutter | 24px (`gap-6`) | Between card rows |

### 5.3 Responsive Breakpoints
- `sm:` 640px — Minimum supported width (tablet landscape)
- `md:` 768px — Compact desktop
- `lg:` 1024px — Standard operational terminal
- `xl:` 1280px — Wide display (bridge console)
- `2xl:` 1536px — Ultra-wide (multi-monitor operations)

*This dashboard targets desktop-primary use. Mobile layout is not supported in v1.0.*

---

## 6. Materiality — Glassmorphism Protocol

### 6.1 Philosophy
The glass effect is not decorative. It communicates layering — the card is above the ocean photography background, visually suspended. The frosted opacity means the background still contributes to the ambient mood while not competing with data.

### 6.2 Glass Surface Variants

**Base Glass Card**
```css
.glass-card {
  background: rgba(10, 37, 64, 0.60); /* ocean-800 at 60% */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
}
```
*Tailwind:* `bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl`

**Elevated Glass Card (active, selected, highlighted)**
```css
.glass-card-elevated {
  background: rgba(20, 66, 114, 0.65); /* ocean-700 at 65% */
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 229, 255, 0.20);
  border-radius: 12px;
  box-shadow: 0 0 30px -8px rgba(0, 229, 255, 0.12);
}
```
*Tailwind:* `bg-ocean-700/65 backdrop-blur-xl border border-ice-500/20 rounded-xl shadow-[0_0_30px_-8px_rgba(0,229,255,0.12)]`

**Glass Card — Degraded / Dropout State**
```css
.glass-card-dropout {
  background: rgba(10, 37, 64, 0.40);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.15); /* steel-400 */
  border-radius: 12px;
  /* Diagonal stripe overlay via pseudo-element */
}
```

**Interactive Glass Card (hover-capable)**
```css
.glass-card-interactive {
  /* Base state */
  background: rgba(10, 37, 64, 0.60);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-card-interactive:hover {
  background: rgba(20, 66, 114, 0.65);
  border-color: rgba(0, 229, 255, 0.25);
  box-shadow: 0 8px 32px -8px rgba(0, 229, 255, 0.15);
  transform: translateY(-2px);
}
```

### 6.3 Background Canvas System
The page background is a Framer Motion crossfade between Southern Ocean photography. The base CSS:
```css
.background-canvas {
  position: fixed; inset: 0; z-index: -1;
  background-color: #020b14; /* ocean-950 fallback */
}
.background-image {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  opacity: 0.35; /* Photos should never compete with data */
  filter: saturate(0.6) brightness(0.7);
}
```

---

## 7. Component Library

### 7.1 MetricCard
The primary data display unit. Renders a single telemetry parameter.

**Anatomy:**
```
┌─────────────────────────────────────────┐
│ [Source Badge]                   [Icon] │
│                                         │
│ PARAMETER LABEL                         │
│                                         │
│ 000.00 UNIT   ← JetBrains Mono, data-xl │
│                                         │
│ Depth: 487m · Updated 00:12 UTC         │ ← body-sm, steel-400
└─────────────────────────────────────────┘
```

**Props:**
```typescript
interface MetricCardProps {
  label: string;      // e.g. "Sea Surface Temperature"
  value: string;      // e.g. "2.34"
  unit: string;       // e.g. "°C"
  source: 'LIVE' | 'VIRTUAL' | 'DATASET' | 'PLANNED';
  depth?: string;     // e.g. "487m"
  timestamp?: string; // ISO 8601 UTC
  icon?: React.ReactNode;
  status?: 'nominal' | 'degraded' | 'dropout';
  trend?: 'up' | 'down' | 'stable';
}
```

**States:**
| State | Visual Treatment |
| --- | --- |
| `nominal` | Base glass card, cyan value text |
| `degraded` | Amber border `border-amber-500/40`, amber badge |
| `dropout` | Dropout glass style, striped overlay, `SIGNAL LOST` replaces value |

### 7.2 SectionHeader
```
┌─────────────────────────────────────────────────────────────┐
│ ═══ OCEAN STATE                            [Page Nav Pills] │
│ Physical Environment · CTD Array                            │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 SystemStatusRow
A compact horizontal strip for global telemetry health, always visible at the top of the sidebar.
```
● MQTT BROKER     ONLINE       14:32:07 UTC
● CTD ARRAY       NOMINAL      487m
⚠ FLUOROMETER     DEGRADED     —
● SONAR (PS-26057) NOMINAL      Active Sweep
```

### 7.4 DepthProfileChart
The Recharts vertical depth profile (used on Ocean State page). Chart is rotated so depth increases downward on the Y-axis.
```
Depth (m) │ Value
──────────┼──────────────
    0m    │ ████████████  2.34°C
  100m    │ ████████      1.87°C
  200m    │ ██████        1.42°C
  500m    │ ████          0.94°C
 1000m    │ ██            0.21°C
 2000m    │ █            -0.18°C
```

### 7.5 SparklineCard
Used on Biogeochemistry page for virtual sensor channels.
```
┌──────────────────────────────────────┐
│ [VIRTUAL]                     [Icon] │
│ DISSOLVED OXYGEN                     │
│                                      │
│ ~~~~~~~~~~~~~~~▼                     │ ← Recharts LineChart, no axes
│                                      │
│ 215.4 µmol/kg           ▼ -2.1%/hr   │
└──────────────────────────────────────┘
```
Dropout state replaces the sparkline with a flat dashed line and overlaid `SIGNAL LOST` text.

### 7.6 AcousticShadowZoneOverlay
Used exclusively on Seafloor Intelligence page. A translucent amber-hatched overlay rendered over SSS imagery tiles indicating reduced sonar confidence zones.
```css
.acoustic-shadow-overlay {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(251, 146, 60, 0.15) 4px,
    rgba(251, 146, 60, 0.15) 8px
  );
  border: 1px solid rgba(251, 146, 60, 0.30);
}
```
Confidence penalty display:
```jsx
<div className="glass-card p-3 text-center">
  <p className="text-xs uppercase tracking-wider text-steel-400 font-sans mb-1">
    Confidence Score
  </p>
  <p className="text-2xl font-bold font-mono text-amber-400">
    {score}% <span className="text-xs text-steel-400 ml-1">(-{penalty}% shadow)</span>
  </p>
</div>
```

### 7.7 MQTTBrokerStatusCard
Used on Mission Control page. Communicates online/offline MQTT state and cached record count.
- **Online state:** Green border, live packet count ticking.
- **Offline state:** Amber border, amber pulsing dot, display of pending sync queue size.

---

## 8. Data Provenance Badges
*This section is authoritative. Any AI agent generating data display components must implement these badges exactly as specified.*

### 8.1 Badge Specifications

| Source | Label | Background | Border | Text | Dot |
| --- | --- | --- | --- | --- | --- |
| **LIVE** | ● LIVE | `ice-500/10` | `ice-500/40` | `ice-500` | Animated pulse |
| **VIRTUAL** | VIRTUAL | `purple-500/10` | `purple-400/40` | `purple-400` | Static |
| **DATASET** | DATASET | `emerald-500/10` | `emerald-400/40` | `emerald-400` | Static |
| **PLANNED** | PLANNED | `orange-500/10` | `orange-400/40` | `orange-400` | Static |

### 8.2 Placement Rules
- Badges render before the metric label in the DOM (top-left of card).
- Badges are never hidden, even on hover or in compact mode.
- In chart contexts, badges appear in the chart legend, colour-coded to the series.
- In table contexts, badges occupy a dedicated Source column — it is never merged with another column.

---

## 9. Graceful Degradation System

### 9.1 Dropout State Hierarchy
`NOMINAL` → `DEGRADED` → `DROPOUT` → `OFFLINE`

| State | Trigger | Visual Response |
| --- | --- | --- |
| `NOMINAL` | Signal within spec | Base glass card |
| `DEGRADED` | Signal >2σ from baseline, or packet loss >5% | Amber border, amber warning badge |
| `DROPOUT` | No packets received for >30 seconds | Striped overlay, `SIGNAL LOST` text, value replaced with `———` |
| `OFFLINE` | Component/subsystem reported offline | Dark glass card, steel-coloured badge, timestamp of last known value |

### 9.2 Dropout Visual Specification
When a card enters `DROPOUT` state:
- A diagonal stripe overlay communicates noise/static visually.
- The primary value is replaced with `Signal Lost`.
- **Critical rule:** The last known value is always displayed in DROPOUT state. Removing it is a scientific data loss event.

### 9.3 Acoustic Shadow Zone Mechanics
On the Seafloor Intelligence page, bounding box confidence scores are reduced by the shadow penalty:
`Displayed Confidence = Raw Classifier Score × (1 - Shadow Coverage %)`

The shadow coverage percentage must be displayed alongside the score. The UI must never display only the raw classifier score when shadow coverage is present — doing so overstates sonar detection confidence.

### 9.4 Network Degradation on Mission Control
When the MQTT broker connection is lost:
1. The sidebar `SystemStatusRow` for MQTT immediately shows ● → ⚠ (amber pulsing dot).
2. The `MQTTBrokerStatusCard` switches to offline state within one polling interval (≤5 seconds).
3. Local cache indicator shows record accumulation in real-time.
4. No full-page error overlay. The rest of the dashboard continues to display last-known values with appropriate timestamps.
5. On reconnection, the sync animation shows a progress indicator (not a spinner) with record count.

---

## 10. Layout Architecture

### 10.1 Shell Structure
```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px)     │ MAIN CONTENT AREA                      │
│                     │                                        │
│ ┌─────────────────────┐ │ ┌───────────────────────────┐          │
│ │ Mission Identity    │ │ │ SectionHeader             │          │
│ │ (Logo + Mission ID) │ │ └───────────────────────────┘          │
│ ├─────────────────────┤ │                                        │
│ │ Page Navigation     │ │ ┌───────────────────────────┐          │
│ │ (4 pages)           │ │ │ Page Content              │          │
│ ├─────────────────────┤ │ │ (Scrollable)              │          │
│ │ System Status       │ │ │                           │          │
│ │ (Live health rows)  │ │ │                           │          │
│ ├─────────────────────┤ │ └───────────────────────────┘          │
│ │ Mission Clock       │ │                                        │
│ │ (UTC / Mission ET)  │ │                                        │
│ └─────────────────────┘ │                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Page Specifications

### 11.1 Page 1 — Ocean State
- **Purpose:** Physical environment monitoring from CTD (Conductivity-Temperature-Depth) array.
- **Data sources:** `LIVE` telemetry from physical sensors.
- **Primary user task:** Identify anomalous physical parameters; verify instrument depth accuracy.
- **Layout:** 4 metric cards across the top, followed by a vertical Recharts depth profile plot.

### 11.2 Page 2 — Biogeochemistry
- **Purpose:** Virtual sensor fusion display for biogeochemical parameters.
- **Data sources:** `VIRTUAL` (sensor fusion), with `DATASET` fallback.
- **Primary user task:** Identify biological productivity events; detect sensor anomalies.
- **Critical UX requirement:** This page must clearly communicate that DOXY, CHLA, and Nitrate values are modelled outputs, not direct measurements. The `VIRTUAL` badge must be the most visually prominent element on each card.

### 11.3 Page 3 — Seafloor Intelligence
- **Purpose:** AI-assisted Side Scan Sonar (PS-26057) interpretation.
- **Data sources:** `DATASET` (sonar imagery), `VIRTUAL` (AI classifier output).
- **Primary user task:** Review AI-detected seafloor features; adjust for acoustic shadow zone penalties.
- **Layout:** Sonar Tile Viewer (left 60%) with bounding box overlays; Detection Panel (right 40%) with confidence scores.

### 11.4 Page 4 — Mission Control
- **Purpose:** Operational health matrix and connectivity status.
- **Data sources:** `LIVE` (system telemetry), `PLANNED` (mission schedule).
- **Primary user task:** Verify all subsystems are operational; monitor MQTT connectivity; review mission timeline.

---

## 12. Data Visualization Guidelines

### 12.1 General Rules
- Chart backgrounds are transparent. Charts sit on glass cards; a white or dark chart background destroys the glassmorphism effect.
- Gridlines use `steel-800` at 40% opacity. They guide the eye without competing with the data.
- Chart axes use `steel-400`. Never `ice-100` (too bright) or `steel-800` (too dark).
- All tick labels use `font-mono`, `text-xs`. Coordinates, values, and units are data — they use the data font.
- Tooltips use the glass-card aesthetic. `bg-steel-900/95 backdrop-blur-sm border border-steel-800 rounded-lg p-2`.
- Never use pure red as a data series colour. Use amber for warnings, steel for neutral, cyan for primary series. Red is reserved exclusively for health-critical states.

---

## 13. Motion & Animation

### 13.1 Animation Principles
Every animation must justify its existence. In a scientific monitoring context, animations that are purely decorative are prohibited — they steal operator attention from data.

**Permitted animations:**
- Background image crossfade (conveys environment, subliminal)
- Card entry on page load (communicates data is populating)
- State transitions (`NOMINAL` → `DEGRADED` pulse communicates change of state)
- MQTT sync progress animation (shows background process is active)
- Chart data updates (smooth, prevents jarring jumps)

**Prohibited animations:**
- Continuous spinning / rotating decorative elements
- Parallax effects on scroll
- Attention-grabbing entrance animations for non-critical UI chrome
- Any animation that delays data display by >100ms

---

## 14. Accessibility Requirements
Target: WCAG 2.1 Level AA

### 14.1 Colour Contrast Requirements
| Pair | Ratio | Passes |
| --- | --- | --- |
| `ice-100` on `ocean-800/60` | 7.2:1 | ✅ AAA |
| `ice-200` on `ocean-800/60` | 5.4:1 | ✅ AA |
| `steel-400` on `ocean-900` | 4.6:1 | ✅ AA |
| `ice-500` on `ocean-950` | 6.8:1 | ✅ AAA |
| `amber-400` on `ocean-800` | 5.1:1 | ✅ AA |
| `ice-500` badge text on `ice-500/10` bg | 5.9:1 | ✅ AA |

Never rely on colour alone for status. Every status indicator uses colour and icon and text label. This covers red-green colour blindness (the most common form) which affects ~8% of male users.

---

## 15. Tailwind Configuration Reference

The custom palette is defined under `theme.extend.colors`. Crucially, note the custom `ice` scale — the `ice-500: #00e5ff` acts as the active accent, representing active sonar and live telemetry, distinct from Tailwind's default cyan.

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#020b14',
          900: '#041527',
          800: '#0a2540',
          700: '#144272',
          600: '#1a5276',
        },
        ice: {
          100: '#e0f7fa',
          200: '#b2ebf2',
          400: '#4dd0e1',
          500: '#00e5ff',
          600: '#00b8d4',
        },
        steel: {
          400: '#94a3b8',
          600: '#475569',
          800: '#1e293b',
          900: '#0f172a',
        },
        health: {
          nominal: '#22c55e',
          degraded: '#f59e0b',
          critical: '#ef4444',
          offline: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // ... other configs (blur, box shadow) ...
    },
  },
};
```

---

### Appendix A — Quick Reference Card
For AI coding agents generating new components:
- **Background:** `bg-ocean-800/60 backdrop-blur-md`
- **Border:** `border border-white/[0.07]` or `border-steel-800/60`
- **Border-radius:** `rounded-xl` (12px)
- **Text primary:** `text-ice-100 font-sans`
- **Text data:** `text-ice-100 font-mono text-4xl font-bold`
- **Text label:** `text-steel-400 font-sans text-xs uppercase tracking-wider`
- **Text meta:** `text-steel-400 font-mono text-xs`
- **Accent:** `text-ice-500 border-ice-500 bg-ice-500/10`
- **Hover:** `hover:bg-ocean-700/65 hover:border-ice-500/25`
- **Transition:** `transition-all duration-200`
- **Focus ring:** `focus-visible:outline-2 focus-visible:outline-ice-500 focus-visible:outline-offset-2`

---

**Autonomous Ocean Observation and Seafloor Intelligence Platform — Design System v1.0.0**
*Maintained by the engineering team · NCPOR / NIOT collaboration*
*Last updated: 2026-08-29*
