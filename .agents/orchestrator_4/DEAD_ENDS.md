# Dead Ends Log

| Iteration | Approach Tried | Why It Failed | Files Touched |
|-----------|---------------|---------------|---------------|
| Survey | Planar 1000x1000 `<Grid>` at Y = -137 | Slices through undulating bathymetry causing Z-fighting and clipping | `AntarcticScene.tsx` |
| Survey | Unshaded additive cone meshes for God Rays | Near frustum clipping causes rasterizer saturation to solid white polygons | `AntarcticScene.tsx` |
| Survey | Untyped `ErrorBoundary` class in page | Triggers 8 TypeScript errors under strict Vite build | `AntarcticSimulation.tsx` |
| Survey | Static `Sparkles` box centered at Y=0 | Exits view at depths below -100m, causing marine snow to vanish at seafloor | `AntarcticScene.tsx` |
