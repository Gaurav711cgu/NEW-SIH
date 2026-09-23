# Scope: 3D AUV Model & Environment Scene Refactoring

## Architecture
- React Three Fiber (R3F) + Drei + Postprocessing.
- Target Directory: `/Users/gauravkumarnayak/Desktop/new sih/frontend`
- Target 3D Components:
  - `frontend/src/components/3d/AUVModel.tsx` (AUV components: Main Hull, Optical Glass, Conning Tower, Propulsion Shroud, and diagnostic `<Html>` cards)
  - `frontend/src/components/3d/AntarcticScene.tsx` (Canvas, lights, camera, environment, postprocessing Selection/EffectComposer)
  - `frontend/src/components/3d/Seafloor.tsx` or related terrain models (vertical positioning and depth offset)
  - Environment assets / Fauna (pink balls / untextured domes fix)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Postprocessing & Glowing Outline | Install `@react-three/postprocessing`, wrap scene in `Selection`, apply `Outline`, highlight on hover | M2 | ORIGINAL_REQUEST §R1 |
| 2 | Hover Cursor Pointer | Change cursor to pointer when hovering over interactive components | M2 | ORIGINAL_REQUEST §R1 |
| 3 | Click-to-Toggle Popups | Diagnostic `<Html>` cards open only on click, toggle off or switch on click, initial state zero open | M2 | ORIGINAL_REQUEST §R2 |
| 4 | Physics & Terrain Clipping Fix | Adjust submarine height, terrain offset, or depth logic so AUV never clips into seabed rocks | M3 | ORIGINAL_REQUEST §R3 |
| 5 | Fix Pink/Magenta Meshes | Identify untextured domes/spheres and apply realistic underwater materials | M3 | ORIGINAL_REQUEST §R4 |
| 6 | Clean TypeScript Build | `npm run build` succeeds in `frontend/` with 0 errors | M4 | ORIGINAL_REQUEST §Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Survey & Technical Exploration | Code inspection of AUVModel, AntarcticScene, Seafloor, and environment assets | none | DONE |
| M2 | Interaction & Postprocessing | `@react-three/postprocessing` install, Selection/Outline pass, hover pointer, click-to-toggle popups | M1 | DONE |
| M3 | Physics & Materials Polish | Seafloor elevation / AUV depth positioning, repair pink spheres with realistic materials | M1 | DONE |
| M4 | Build & Review Gate | Full build verification, Reviewer approval, Gate sign-off | M2, M3 | DONE |

## Interface Contracts
### AUV Interaction State
- `activeComponent: string | null` (controlled click-to-toggle state, null by default).
- `hoveredComponent: string | null` (drives Selection/Outline and cursor: pointer).
- Mesh targets: `Main Hull`, `Optical Glass`, `Conning Tower`, `Propulsion Shroud`.

### Seafloor & AUV Elevation
- Submarine trajectory Y-bounds must strictly maintain clearance above the highest peaks of the terrain mesh.
- No intersection between AUV bounding box / collision sphere and terrain geometry.

### Material Integrity
- No default untextured magenta (0xff00ff / missing texture fallback) in rendered meshes.
- Realistic shader/material parameters: roughness, metalness, transmission, emissive or authentic subsurface look.
