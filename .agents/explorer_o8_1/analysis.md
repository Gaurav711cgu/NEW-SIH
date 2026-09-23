# Technical Investigation & Analysis Report: AUVModel, Interactions, & Postprocessing

- **Investigator**: explorer_o8_1
- **Date**: 2026-09-23
- **Targets**: `frontend/src/simulation/auv/AUVModel.tsx`, `frontend/package.json`, `AntarcticScene.tsx`, `CinematicPipeline.tsx`
- **Working Directory**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o8_1`

---

## Executive Summary

This investigation analyzed the 3D submarine model (`AUVModel.tsx`), component interaction architecture, diagnostic `<Html>` overlay behavior, and `@react-three/postprocessing` Outline/Selection integration for the AQUILA OS digital twin.

Key findings:
1. **Model Location**: The file is located at `frontend/src/simulation/auv/AUVModel.tsx` (263 lines). The 4 target meshes (`Main Hull`, `Optical Glass`, `Conning Tower`, `Propulsion Shroud`) are defined with procedural geometries and physically based materials.
2. **Current Diagnostic `<Html>` Cards**: Rendered conditionally via local state `activeComponent === '<ID>'`. While `activeComponent` initializes to `null`, there is currently no click-away dismissal, clicking another mesh or canvas background fails to dismiss, and the card itself has `pointer-events-none` preventing close interactions.
3. **Selection & Outline Architecture**: `@react-three/postprocessing` v3.1.1 is already installed and exports `<Selection>`, `<Select>`, and `<Outline>`. `<Selection>` **must be placed inside `<Canvas>`** in `AntarcticScene.tsx` (not outside Canvas) so that `<Select>` in `AUVModel.tsx` and `<Outline>` inside `<EffectComposer>` in `CinematicPipeline.tsx` share the same context. `<EffectComposer autoClear={false}>` is required by the `Outline` effect.
4. **Package Compatibility & Build Status**: `react` 19.2.8, `@react-three/fiber` 9.7.0, `@react-three/postprocessing` 3.1.1, and `three` 0.185.1 are fully compatible with React 19. However, `npm run build` currently fails due to 9 occurrences of `pointerEvents="none"` on Three elements in `AUVModel.tsx` (invalid ThreeElements prop TS2322).
5. **Cursor Management**: Currently managed via `useEffect` setting `document.body.style.cursor`. It should either use `@react-three/drei`'s `useCursor` hook (scoped to the WebGL canvas) or maintain the state with proper cleanup, with `raycast={() => null}` replacing `pointerEvents="none"` on non-interactive meshes.

---

## Question 1: Mesh Definitions & Locations in `AUVModel.tsx`

File: `frontend/src/simulation/auv/AUVModel.tsx`

The root container is a group:
```tsx
// Lines 56-57
<group ref={groupRef} dispose={null} scale={0.6}>
```
Animated in `useFrame` (lines 23-36) tracking `auvPosition` and `auvRotation` from `useSimulationStore`.

### 1. Main Hull (`BATTERY`)
- **Location**: Lines 58–81
- **Code Snippet**:
```tsx
58:       {/* ── HIGH-FIDELITY HYDRODYNAMIC HULL (BATTERY) ── */}
59:       <mesh 
60:         rotation={[0, 0, Math.PI / 2]} 
61:         castShadow 
62:         receiveShadow
63:         onClick={(e) => { e.stopPropagation(); setActiveComponent(activeComponent === 'BATTERY' ? null : 'BATTERY'); }}
64:         onPointerOver={(e) => { e.stopPropagation(); setHovered('BATTERY'); }}
65:         onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
66:       >
67:         <cylinderGeometry args={[0.7, 0.7, 4.5, 64]} />
68:         <meshPhysicalMaterial 
69:           color="#111827" 
70:           metalness={0.6} 
71:           roughness={0.4} 
72:           clearcoat={0.3} 
73:           emissive={hovered === 'BATTERY' || activeComponent === 'BATTERY' ? '#00e5ff' : '#000000'}
74:           emissiveIntensity={0.2}
75:         />
76:         {activeComponent === 'BATTERY' && (
77:           <Html position={[0, -1.2, 0]} center zIndexRange={[100, 0]}>
78:             <Card title="MAIN BATTERY POD" icon={Battery} stats={[{label: 'CAPACITY', val: '72.4 kWh'}, {label: 'CELL TEMP', val: '4.2°C'}, {label: 'DRAW', val: '1.2 kW'}]} />
79:           </Html>
80:         )}
81:       </mesh>
```
- **Geometry**: `<cylinderGeometry args={[0.7, 0.7, 4.5, 64]} />` (cylinder rotated 90° along Z axis, diameter 1.4m, length 4.5m, 64 radial segments).
- **Associated Hull Trims**:
  - Tactical yellow stripe (lines 84–87): `<cylinderGeometry args={[0.705, 0.705, 2.0, 64]} />`
  - Titanium nose parabola (lines 90–93): `<sphereGeometry args={[0.7, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />`
  - Carbon tailcone (lines 129–132): `<cylinderGeometry args={[0.2, 0.7, 1.8, 64]} />`
  - 4 X-Rudder fins (lines 179–186): `<boxGeometry args={[0.6, 0.8, 0.04]} />`

### 2. Optical Glass (`SENSOR`)
- **Location**: Lines 95–120
- **Code Snippet**:
```tsx
95:       {/* Optical Glass Payload Window (Nose) (SENSOR) */}
96:       <mesh 
97:         position={[2.8, 0, 0]} 
98:         rotation={[0, 0, -Math.PI / 2]}
99:         onClick={(e) => { e.stopPropagation(); setActiveComponent(activeComponent === 'SENSOR' ? null : 'SENSOR'); }}
100:         onPointerOver={(e) => { e.stopPropagation(); setHovered('SENSOR'); }}
101:         onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
102:       >
103:         <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
104:         <meshPhysicalMaterial 
105:           color="#00e5ff" 
106:           metalness={0.1} 
107:           roughness={0.05} 
108:           transmission={0.95} 
109:           thickness={0.5} 
110:           transparent 
111:           opacity={0.8} 
112:           emissive={hovered === 'SENSOR' || activeComponent === 'SENSOR' ? '#00e5ff' : '#000000'}
113:           emissiveIntensity={hovered === 'SENSOR' ? 1.5 : 0}
114:         />
115:         {activeComponent === 'SENSOR' && (
116:           <Html position={[1.5, 0, 0]} center zIndexRange={[100, 0]}>
117:             <Card title="AI OPTICAL MATRIX" icon={Activity} stats={[{label: 'MODEL', val: 'YOLOv8-MARINE'}, {label: 'INFERENCE', val: '42ms'}, {label: 'LENS HT', val: 'ACTIVATED'}]} />
118:           </Html>
119:         )}
120:       </mesh>
```
- **Geometry**: `<sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />` (dome window with radius 0.4m at nose coordinate `[2.8, 0, 0]`).
- **Material**: Transmissive optical glass `meshPhysicalMaterial` (transmission 0.95, roughness 0.05, thickness 0.5).
- **Sub-assembly**: Internal Sensor Eye (lines 122–126) at `[2.7, 0, 0]`.

### 3. Conning Tower (`COMMS`)
- **Location**: Lines 134–176
- **Code Snippet**:
```tsx
134:       {/* ── CONNING TOWER / SAIL (COMMS) ── */}
135:       <group 
136:         position={[0.5, 0.9, 0]}
137:         onClick={(e) => { e.stopPropagation(); setActiveComponent(activeComponent === 'COMMS' ? null : 'COMMS'); }}
138:         onPointerOver={(e) => { e.stopPropagation(); setHovered('COMMS'); }}
139:         onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
140:       >
141:         <mesh castShadow receiveShadow>
142:           <boxGeometry args={[1.5, 0.5, 0.3]} />
143:           <meshPhysicalMaterial 
144:             color="#facc15" 
145:             metalness={0.3} 
146:             roughness={0.2} 
147:             clearcoat={0.9} 
148:             emissive={hovered === 'COMMS' || activeComponent === 'COMMS' ? '#00e5ff' : '#000000'}
149:             emissiveIntensity={0.3}
150:           />
151:         </mesh>
152:         
153:         {/* Antenna Mast */}
154:         <mesh position={[0.4, 0.6, 0]}>
155:           <cylinderGeometry args={[0.03, 0.05, 0.8, 16]} />
156:           <meshStandardMaterial color="#334155" metalness={0.9} />
157:         </mesh>
158:         
159:         {/* Iridium SATCOM Puck */}
160:         <mesh position={[-0.3, 0.3, 0]}>
161:           <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
162:           <meshStandardMaterial color="#f8fafc" />
163:         </mesh>
164:         
165:         {/* Flashing Beacon */}
166:         <mesh position={[0.4, 1.05, 0]}>
167:           <sphereGeometry args={[0.06]} />
168:           <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={5} />
169:         </mesh>
170: 
171:         {activeComponent === 'COMMS' && (
172:           <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
173:             <Card title="UHF / SATCOM ARRAY" icon={Radio} stats={[{label: 'UHF LINK', val: 'NO SIGNAL'}, {label: 'IRIDIUM SBD', val: 'STANDBY'}, {label: 'ACOUSTIC', val: 'TX/RX OK'}]} />
174:           </Html>
175:         )}
176:       </group>
```
- **Structure**: Group at `position={[0.5, 0.9, 0]}` containing the primary sail body (`boxGeometry [1.5, 0.5, 0.3]`), Antenna Mast cylinder, Iridium SATCOM puck, and Red Flashing Beacon sphere.

### 4. Propulsion Shroud (`THRUSTER`)
- **Location**: Lines 188–229
- **Code Snippet**:
```tsx
188:       {/* ── PROPULSION SYSTEM (THRUSTER) ── */}
189:       <group 
190:         position={[-4.1, 0, 0]}
191:         onClick={(e) => { e.stopPropagation(); setActiveComponent(activeComponent === 'THRUSTER' ? null : 'THRUSTER'); }}
192:         onPointerOver={(e) => { e.stopPropagation(); setHovered('THRUSTER'); }}
193:         onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
194:       >
195:         {/* Shroud / Duct */}
196:         <mesh rotation={[0, 0, Math.PI / 2]}>
197:           <tubeGeometry args={[new THREE.LineCurve3(new THREE.Vector3(0, -0.35, 0), new THREE.Vector3(0, 0.35, 0)), 64, 0.02, 16, true]} />
198:           <meshStandardMaterial 
199:             color="#1e293b" 
200:             metalness={0.8} 
201:             roughness={0.2} 
202:             emissive={hovered === 'THRUSTER' || activeComponent === 'THRUSTER' ? '#00e5ff' : '#000000'}
203:             emissiveIntensity={0.5}
204:           />
205:         </mesh>
206:         
207:         <group ref={propRef}>
208:           {/* Hub */}
209:           <mesh rotation={[0, 0, Math.PI / 2]}>
210:             <cylinderGeometry args={[0.15, 0.12, 0.3, 32]} />
211:             <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
212:           </mesh>
213:           {/* 7-Blade Scimitar Propeller */}
214:           {[...Array(7)].map((_, i) => (
215:             <group key={`blade-${i}`} rotation={[Math.PI/2, (i * Math.PI * 2) / 7, 0]}>
216:               <mesh position={[0, 0.22, 0]} rotation={[0, 0.2, 0.3]}>
217:                 <boxGeometry args={[0.02, 0.4, 0.1]} />
218:                 <meshStandardMaterial color="#facc15" metalness={0.6} roughness={0.4} />
219:               </mesh>
220:             </group>
221:           ))}
222:         </group>
223:         
224:         {activeComponent === 'THRUSTER' && (
225:           <Html position={[-1, 1, 0]} center zIndexRange={[100, 0]}>
226:             <Card title="MAIN PROPULSION" icon={Zap} stats={[{label: 'RPM', val: '450'}, {label: 'TORQUE', val: '12 Nm'}, {label: 'MODE', val: 'ECO-CRUISE'}]} />
227:           </Html>
228:         )}
229:       </group>
```
- **Structure**: Group at `position={[-4.1, 0, 0]}`. The shroud itself is a tubular duct mesh using `tubeGeometry args={[new THREE.LineCurve3(new THREE.Vector3(0, -0.35, 0), new THREE.Vector3(0, 0.35, 0)), 64, 0.02, 16, true]}`, containing the rotating propeller assembly (`propRef`) with hub and 7 scimitar blades.

---

## Question 2: Diagnostic `<Html>` Cards, Initial Visibility, & Click-to-Toggle

### 1. Current Rendering Mechanism
- In `AUVModel.tsx`:
  - Line 13: `const [activeComponent, setActiveComponent] = useState<string | null>(null);`
  - Lines 38–53: `Card` component renders a frosted glass card with title, icon, and stat rows:
    ```tsx
    const Card = ({ title, icon: Icon, stats }: { title: string, icon: any, stats: {label: string, val: string}[] }) => (
      <div className="bg-[#0c0c0c]/90 backdrop-blur-md border-2 border-ice-500 rounded-xl p-4 shadow-[0_0_20px_rgba(0,229,255,0.4)] w-56 pointer-events-none transform -translate-y-1/2">
        ...
      </div>
    );
    ```
  - Conditional guards:
    - Main Hull (Battery): Line 76: `{activeComponent === 'BATTERY' && (<Html ...><Card ... /></Html>)}`
    - Optical Glass (Sensor): Line 115: `{activeComponent === 'SENSOR' && (<Html ...><Card ... /></Html>)}`
    - Conning Tower (Comms): Line 171: `{activeComponent === 'COMMS' && (<Html ...><Card ... /></Html>)}`
    - Propulsion Shroud (Thruster): Line 224: `{activeComponent === 'THRUSTER' && (<Html ...><Card ... /></Html>)}`

### 2. Why Popups Appear Visible or Fail to Dismiss
1. **Initial Mount**: Currently, `useState<string | null>(null)` is set. However, during previous iterations, `activeComponent` had been defaulted to a component (e.g. in test runs), or `ComponentInspector` in `simulationStore` was active on load.
2. **Missing Blank Space Dismissal (`onPointerMissed`)**: In the current code, clicking into empty water, seafloor, or sky does NOT close an open card. Only clicking the exact same 3D mesh again can close it. To a user or reviewer, if a card was clicked, it remains stuck open indefinitely.
3. **Card Unclickable (`pointer-events-none`)**: `Card` has `pointer-events-none` (line 39). Therefore, the user cannot click on the card to dismiss or interact with it.
4. **Stale Closures on `onClick`**: The inline `onClick` handlers currently write:
   `setActiveComponent(activeComponent === 'BATTERY' ? null : 'BATTERY')`
   In fast succession or race conditions, reading `activeComponent` directly rather than using a functional updater `prev => prev === id ? null : id` can lead to stale state updates.

### 3. Clean Click-to-Toggle Implementation
To guarantee:
- **Zero cards open on initial load**
- **Clicking an unselected component opens its card**
- **Clicking the currently open component closes it**
- **Clicking a different component switches directly to that card**
- **Clicking anywhere else in the 3D scene (empty space) dismisses the card**

```tsx
// In AUVModel.tsx:
const [activeComponent, setActiveComponent] = useState<string | null>(null);

// Functional toggle handler
const toggleComponent = (id: string, e?: any) => {
  if (e?.stopPropagation) e.stopPropagation();
  setActiveComponent((prev) => (prev === id ? null : id));
};

// Add onPointerMissed on the root group to close on background click:
<group 
  ref={groupRef} 
  dispose={null} 
  scale={0.6}
  onPointerMissed={() => setActiveComponent(null)}
>
```
On each interactive mesh / group:
```tsx
onClick={(e) => toggleComponent('BATTERY', e)}
```
In `Card`:
Add an explicit close button with `pointer-events-auto`:
```tsx
const Card = ({ title, icon: Icon, stats, onClose }: { title: string, icon: any, stats: {label: string, val: string}[], onClose: () => void }) => (
  <div className="bg-[#0c0c0c]/90 backdrop-blur-md border-2 border-ice-500 rounded-xl p-4 shadow-[0_0_20px_rgba(0,229,255,0.4)] w-56 pointer-events-auto transform -translate-y-1/2">
    <div className="flex items-center justify-between gap-3 mb-3 border-b border-ice-500/30 pb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-ice-400" />
        <span className="text-[11px] font-mono font-bold text-ice-100 tracking-wider">{title}</span>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="text-steel-400 hover:text-ice-300 text-xs px-1 cursor-pointer"
      >
        ✕
      </button>
    </div>
    ...
  </div>
);
```

---

## Question 3: `@react-three/postprocessing` Selection & Outline Integration

### 1. Library Architecture Inspection
Inspected `/Users/gauravkumarnayak/Desktop/new sih/frontend/node_modules/@react-three/postprocessing`:
- `src/Selection.tsx`:
  - `Selection`: Context provider (`selectionContext.Provider`) that stores `[selected, select] = useState<Object3D[]>([])`.
  - `Select`: Component rendering a `<group ref={group}>`. When `enabled={true}`, it traverses children, checks `isSelectable(o)` (checking `isMesh`, `isLine`, `isPoints`), and adds them to `selectionContext`. When disabled or unmounted, it removes them.
- `src/effects/Outline.tsx`:
  - Instantiates `OutlineEffect(scene, camera, ...)` from `postprocessing`.
  - Calls `useSelectionSync(effect, selection, selectionLayer)` which consumes `use(selectionContext)` and dynamically executes `effect.selection.set(api.selected)`.
  - Line 68–70:
    ```tsx
    if (autoClear !== false) {
      console.warn('Outline requires <EffectComposer autoClear={false}> to render correctly.')
    }
    ```

### 2. Does Canvas need `<Selection>` around it or in `AntarcticScene.tsx`?
- `<Selection>` **CANNOT** be placed outside / around `<Canvas>`.
- `<Selection>` **MUST be placed INSIDE `<Canvas>` in `AntarcticScene.tsx`**!
- **Reasoning**:
  1. `<Select>` renders an R3F `<group>` element. In React 19 / R3F v9, `<group>` is an R3F intrinsic element managed by R3F's reconciler. Outside `<Canvas>`, `<group>` throws DOM errors.
  2. `<Outline>` renders `<primitive object={effect} />` and uses `use(EffectComposerContext)` and `useThree()`. It must be inside `<EffectComposer>`, which must be inside `<Canvas>`.
  3. `<Select>` (inside `AUVModel`) and `<Outline>` (inside `CinematicPipeline`) must share the same React Context (`selectionContext`).
  4. Placing `<Selection>` as a direct child of `<Canvas>` in `AntarcticScene.tsx` wraps both `<AUVModel />` and `<CinematicPipeline />`, allowing context to pass seamlessly between them!

### 3. Hierarchy in `AntarcticScene.tsx`:
```tsx
export default function AntarcticScene() {
  return (
    <div className="w-full h-full bg-[#000000]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [10, 5, 10], fov: 60, near: 0.1, far: 1000 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Selection>
          <OceanEnvironment />
          <BubbleSystem />
          <MissionDirector />
          <CameraManager />
          <group>
            <AUVModel />
          </group>
          <CinematicPipeline />
        </Selection>
      </Canvas>
    </div>
  );
}
```

### 4. Wrapping `<Select enabled={hovered === '<ID>'}>` Around the 4 Meshes
Yes! In `AUVModel.tsx`:
```tsx
import { Select } from '@react-three/postprocessing';

// 1. Main Hull
<Select enabled={hovered === 'BATTERY'}>
  <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow ...>
    <cylinderGeometry args={[0.7, 0.7, 4.5, 64]} />
    ...
  </mesh>
</Select>

// 2. Optical Glass
<Select enabled={hovered === 'SENSOR'}>
  <mesh position={[2.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]} ...>
    <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
    ...
  </mesh>
</Select>

// 3. Conning Tower
<Select enabled={hovered === 'COMMS'}>
  <group position={[0.5, 0.9, 0]} ...>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1.5, 0.5, 0.3]} />
      ...
    </mesh>
    ...
  </group>
</Select>

// 4. Propulsion Shroud
<Select enabled={hovered === 'THRUSTER'}>
  <mesh rotation={[0, 0, Math.PI / 2]}>
    <tubeGeometry args={[new THREE.LineCurve3(new THREE.Vector3(0, -0.35, 0), new THREE.Vector3(0, 0.35, 0)), 64, 0.02, 16, true]} />
    ...
  </mesh>
</Select>
```

### 5. `CinematicPipeline.tsx` Configuration:
```tsx
import {
  EffectComposer,
  N8AO,
  DepthOfField,
  Bloom,
  Vignette,
  Outline,
} from '@react-three/postprocessing';

export default function CinematicPipeline() {
  ...
  return (
    <EffectComposer multisampling={8} enableNormalPass={false} autoClear={false}>
      <N8AO ... />
      <DepthOfField ... />
      <Bloom ... />
      <Outline
        visibleEdgeColor="#00e5ff"
        hiddenEdgeColor="#005577"
        edgeStrength={6.0}
        blur
        pulseSpeed={0.0}
      />
      <Vignette ... />
    </EffectComposer>
  );
}
```

---

## Question 4: Package Versions & Compatibility Analysis

### 1. Exact Versions from `frontend/package.json` & `node_modules`:
| Package | `package.json` Spec | Installed Version |
|---|---|---|
| `react` | `^19.2.8` | `19.2.8` |
| `react-dom` | `^19.2.8` | `19.2.8` |
| `@react-three/fiber` | `^9.7.0` | `9.7.0` |
| `@react-three/drei` | `^10.7.8` | `10.7.8` |
| `@react-three/postprocessing` | `^3.1.1` | `3.1.1` |
| `postprocessing` | `^6.39.5` | `6.39.5` |
| `three` | `^0.185.1` | `0.185.1` |
| `@types/three` | `^0.185.4` | `0.185.4` |
| `typescript` | `~6.0.2` | `6.0.2` |
| `vite` | `^8.2.2` | `8.2.2` |

### 2. Version Compatibility Notes
1. **React 19 & R3F v9**:
   - `@react-three/fiber` 9.7.0 is built for React 19 support.
   - `@react-three/postprocessing` 3.1.1 lists peerDependencies: `"react": "^19.0.0"`, `"@react-three/fiber": ">=9.7.0"`, `"postprocessing": "^6.36.0"`, `"three": ">= 0.156.0"`.
   - `Selection.tsx` directly uses React 19's `use(selectionContext)`.
   - Result: All Three/React libraries are on matching, modern versions with zero peer dependency conflicts.
2. **Current TypeScript Compiler Errors**:
   Running `npm run build` currently detects 12 errors:
   - **`AUVModel.tsx` (9 errors)**: Lines 84, 90, 123, 129, 180, 236, 240, 249, 253 have `pointerEvents="none"` on `<mesh>` and `<group>` elements:
     `error TS2322: Property 'pointerEvents' does not exist on type 'Mutable<Overwrite<Partial<Overwrite<Mesh...>>>>'`.
     In R3F, `pointerEvents` is not a valid prop on Three elements.
   - **`DebrisField.tsx` (3 errors)**:
     - TS6133: `'useState' is declared but its value is never read.` (line 1).
     - TS7034 / TS7005: `Variable 'attr' implicitly has type 'any'` (lines 44, 46).
   Removing `pointerEvents="none"` from `AUVModel.tsx` and typing `attr` in `DebrisField.tsx` will yield clean TypeScript compilation.

---

## Question 5: Cursor Management on Hover

### 1. Current Implementation in `AUVModel.tsx`
```tsx
14:   const [hovered, setHovered] = useState<string | null>(null);
15: 
16:   useEffect(() => {
17:     document.body.style.cursor = hovered ? 'pointer' : 'auto';
18:     return () => {
19:       document.body.style.cursor = 'auto';
20:     };
21:   }, [hovered]);
```
- Each of the 4 components has:
  `onPointerOver={(e) => { e.stopPropagation(); setHovered('BATTERY'); }}`
  `onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}`

### 2. Problems & Recommended Improvements
1. **Scope of Cursor Modification**:
   - `document.body.style.cursor` changes the cursor globally across the entire document. If the user moves their mouse quickly onto floating HUD cards or outside the window, the cursor may get desynced.
   - **Recommended Approach**: `@react-three/drei` exports `useCursor`:
     ```tsx
     import { useCursor } from '@react-three/drei';
     
     // Inside AUVModel:
     useCursor(Boolean(hovered), 'pointer', 'auto');
     ```
     `useCursor` binds cursor manipulation directly to `gl.domElement` (the `<canvas>` element). When the mouse leaves the canvas or hovers over DOM UI overlays, the browser naturally restores the DOM cursor.
2. **Preventing Raycast Hijacking on Decorative Meshes**:
   - To prevent decorative meshes (yellow stripes, carbon trim, nose dome, lights) from intercepting raycasts or triggering false pointer events, do NOT use `pointerEvents="none"`.
   - Instead, either:
     - Rely on standard Three.js raycasting: since they have no `onPointerOver`/`onPointerOut`/`onClick` handlers, and the interactive meshes call `e.stopPropagation()`.
     - Or set `raycast={() => null}` on occluding decorative meshes (e.g. the yellow striping cylinder covering the center hull). In Three.js, `raycast: () => null` makes an Object3D completely invisible to raycasting while preserving valid TypeScript types.

---

## Conclusion & Implementation Guide for Implementer Agent

| Target File | Change Summary |
|---|---|
| `AntarcticScene.tsx` | Import `Selection` from `@react-three/postprocessing`. Wrap `<Canvas>` inner tree with `<Selection>`. |
| `AUVModel.tsx` | 1. Import `Select` from `@react-three/postprocessing`.<br>2. Remove all 9 invalid `pointerEvents="none"` props (use `raycast={() => null}` where needed).<br>3. Wrap the 4 meshes in `<Select enabled={hovered === '<ID>'}>`.<br>4. Implement clean click-to-toggle with `onPointerMissed={() => setActiveComponent(null)}`.<br>5. Use `useCursor(Boolean(hovered))` from `@react-three/drei`.<br>6. Add close button on `Card` with `pointer-events-auto`. |
| `CinematicPipeline.tsx` | 1. Add `autoClear={false}` to `<EffectComposer>`.<br>2. Import and insert `<Outline visibleEdgeColor="#00e5ff" hiddenEdgeColor="#004466" edgeStrength={5} blur />`. |
