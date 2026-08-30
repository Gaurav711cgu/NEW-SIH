# 🌊 AQUILA — Side-Scan Sonar (SSS) Testing Images Suite
**Curated Benchmark Images for PS-26057 Evaluation & Live Demonstrations**

This directory contains **25 diverse and difficult Side-Scan Sonar (SSS) images** designed to test edge AI detection, speckle noise reduction, SAHI window slicing, and acoustic shadow physics calibration.

---

### 📂 Image Catalog & Difficulty Breakdown:

| # | Image Filename | Target Category | Technical Challenge / Benchmark Value |
|---|---|---|---|
| **01** | `01_shipwreck_large_waterfall.jpg` | Shipwreck / Vessel | Massive swath (595x633 px), high backscatter hull return. |
| **02** | `02_sunken_vessel_hull_structure.jpg` | Shipwreck / Structure | Elongated metallic keel profile on sandy seafloor. |
| **03** | `03_cylinder_mine_specular_highlight.jpg` | Cylinder / UXO Mine | High specular acoustic reflection + sharp trailing shadow. |
| **04** | `04_subsea_debris_high_noise.jpg` | Entangled Debris | Low SNR (Signal-to-Noise Ratio), heavy seabed clutter. |
| **05** | `05_subsea_pipeline_track.jpg` | Subsea Pipe / Cable | Continuous linear feature across multiple sonar pings. |
| **06** | `06_multi_target_debris_field.jpg` | Multi-Target Cluster | Multiple overlapping debris anomalies in close proximity. |
| **07** | `07_shipwreck_broken_keel.jpg` | Fractured Shipwreck | Broken wooden/steel structure fragmented across bathymetry. |
| **08** | `08_metallic_cylinder_shadow_profile.jpg` | Munition / Gas Cylinder | Cylindrical acoustic cross-section with geometric shadow. |
| **09** | `09_subsea_anomaly_acoustic_shadow.jpg` | Acoustic Anomaly | Pronounced acoustic shadow zone testing height estimation. |
| **10** | `10_entangled_debris_cluster.jpg` | Ghost Gear / Net | Irregular porous backscatter signature. |
| **11** | `11_sunken_barge_rectangular_profile.jpg` | Barge / Structure | Rectangular acoustic geometry on sediment. |
| **12** | `12_shipwreck_mast_and_deck.jpg` | Shipwreck Details | Fine vertical mast acoustic reflection. |
| **13** | `13_shallow_water_heavy_speckle.jpg` | Shallow Water Swath | High speckle noise from surface reverberation. |
| **14** | `14_low_contrast_sand_bed_target.jpg` | Buried Debris | Low contrast against ripple sand ripples. |
| **15** | `15_dual_target_cylindrical_mines.jpg` | Dual Cylinders | Two parallel high-density acoustic targets. |
| **16** | `16_subsea_cable_crossing.jpg` | Telecommunication Cable | Narrow linear backscatter trace. |
| **17** | `17_wreckage_fragment_high_backscatter.jpg` | Hull Plating | High intensity specular return plate. |
| **18** | `18_deep_towed_subsea_contact.jpg` | Deep Towed Contact | Low altitude high-resolution target. |
| **19** | `19_rock_formation_natural_shadow.jpg` | Natural Seafloor | Irregular natural topography (False alarm filter test). |
| **20** | `20_wide_swath_waterfall_survey.jpg` | Wide Survey Waterfall | Large scale survey strip. |
| **21** | `21_extreme_speckle_noise_ghost_net.jpg` | Ghost Net / FAD | Extreme Rayleigh noise with porous mesh backscatter. |
| **22** | `22_natural_rock_outcrop_zero_shadow_trap.jpg` | Sediment Discoloration | **Triage Trap:** Flat target with NO shadow -> Penalized to Human Review. |
| **23** | `23_sunken_iso_cargo_container_40ft.jpg` | 40ft ISO Container | Corrugated rectangular hard-edge with 20ftx8ft shadow. |
| **24** | `24_subsea_uxo_mine_cluster_sahi_challenge.jpg` | Mine Cluster (1024x512) | **SAHI Challenge:** 3 small targets needing sliding window slicing. |
| **25** | `25_entangled_synthetic_fad_trawl_mesh.jpg` | Abandoned Trawl Line | Non-linear trailing cable on seabed. |

---

### 🖥️ How to Test in AQUILA Seafloor Intelligence:
1. Open http://localhost:5173/seafloor.
2. Drag and drop any file from `testing_images/` into the upload dropzone.
3. Click **"RUN AQUILA AI ENHANCE"**.
4. The system outputs real-time bounding boxes, calibrated confidence scores, and downloadable MoES JSON/CSV reports.
