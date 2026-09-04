# Forensic Review Report — AQUILA OS Frontend Audit

**Reviewer:** Reviewer 2 (ML, Hardware, Economics & Academic Integrity Reviewer)  
**Date:** 2026-09-03  
**Target Codebase:** `frontend/src/`  
**Authoritative References:** `.agents/ORIGINAL_REQUEST.md`, `PROJECT.md`, `HARDWARE.md`  

---

## 1. Review Summary

**Verdict:** **REQUEST_CHANGES**  
**Risk Level:** MEDIUM (Localized numerical inconsistency in sensor dataset)

### Executive Assessment
The frontend codebase has undergone significant and high-quality remediation across 7 core pages. The purge of legacy strings (`DeepScan`, `YOLOv9`, `monsoon`, `PS-26065`) is 100% complete with zero residual matches. The build compiles cleanly (`npm run build` and `npx tsc --noEmit` exit code 0). Problem statement badges are cleanly consolidated to `PS-26057`.

However, during forensic examination of `src/pages/AUVTwin.tsx`, an adversarial inspection revealed a direct data discrepancy and partial fix:
While the prose descriptions in `indigenousAdvantage` were updated to state authentic sensor comparisons (`Imported ₹1.5 Lakhs SBE 3plus` and `Imported ₹45,000 commercial subsea AHRS module`), the numerical properties in `SENSOR_SPECS` (`importedCostINR: 450000` and `importedCostINR: 1800000`) were **left untouched**. 
As a result, the rendered UI displays contradictory values within the same component card: the metric grid displays `GOVT IMPORT: ₹4.5L` and `GOVT IMPORT: ₹18.0L`, while the paragraph directly underneath asserts `₹1.5 Lakhs` and `₹45,000`.

Because Requirement 3 explicitly mandates *"Verify sensor comparisons are authentic (e.g. SBE 3plus is ~₹1.5 Lakhs)"*, and because Worker 2 self-certified in `worker_2/handoff.md` that it had *"corrected component cost comparisons"* despite leaving the underlying data properties unmodified, this constitutes an unverified claim requiring correction prior to full approval.

---

## 2. Findings

### [Major] Finding 1: Inconsistent SBE 3plus Temperature Comparison Property
- **What:** In `src/pages/AUVTwin.tsx`, the Temperature Probe definition contains a data discrepancy between the numeric property `importedCostINR: 450000` (₹4.5 Lakhs) and the prose description `indigenousAdvantage: 'Cost: ₹80 vs Imported ₹1.5 Lakhs SBE 3plus (1,875x savings). 100% locally serviceable.'`.
- **Where:** `frontend/src/pages/AUVTwin.tsx`, line 65.
- **Why:** On line 1304, the UI renders `₹{(selectedSensor.importedCostINR / 100000).toFixed(1)}L`. When a user clicks the temperature sensor, the prominent GOVT IMPORT card renders `₹4.5L`, directly contradicting the `₹1.5 Lakhs` stated in the ATMANIRBHAR BHARAT DEFENSE card below it. Furthermore, Requirement 3 explicitly requires authentic sensor comparisons where SBE 3plus is ~₹1.5 Lakhs.
- **Suggestion:** In `frontend/src/pages/AUVTwin.tsx:65`, update `importedCostINR: 450000` to `importedCostINR: 150000`.

### [Major] Finding 2: Inconsistent IMU AHRS Comparison Property
- **What:** In `src/pages/AUVTwin.tsx`, the IMU definition contains an inflated numeric property `importedCostINR: 1800000` (₹18.0 Lakhs for a fiber-optic gyro), contradicting the prose description `indigenousAdvantage: 'Cost: ₹150 (MPU6050) vs Imported ₹45,000 commercial subsea AHRS module. 6-axis attitude estimation filtered on edge.'`.
- **Where:** `frontend/src/pages/AUVTwin.tsx`, line 105.
- **Why:** On line 1304, the GOVT IMPORT card renders `₹18.0L`, and the savings calculator on line 1278 computes savings against ₹18 Lakhs. Comparing a ₹150 consumer MPU6050 against an ₹18 Lakh military-grade subsea fiber-optic gyro (iXblue Phins) produces an unrealistic comparison, whereas comparing against a commercial subsea AHRS module (~₹45,000) is grounded.
- **Suggestion:** In `frontend/src/pages/AUVTwin.tsx:105`, update `importedCostINR: 1800000` to `importedCostINR: 45000` (and update `importedEquivalent: 'Commercial Subsea MEMS AHRS Module'`).

### [Minor] Finding 3: Self-Certification Gap in Worker 2 Handoff
- **What:** Worker 2 stated in `worker_2/handoff.md:15` that `AUVTwin.tsx` *"presented inflated foreign sensor cost comparisons (e.g. ₹4.5L for SBE 3 and ₹18L for MPU6050)"*, and concluded in Section 4 that it had *"corrected component cost comparisons"*.
- **Where:** `.agents/worker_2/handoff.md`, lines 15, 59.
- **Why:** The edits modified only the string literal in `indigenousAdvantage`, overlooking the actual typed interface property `importedCostINR` that drives the UI layout and computation. Reviewers must enforce that data model fields align with presentation text.

---

## 3. Systematic Verification by Requirement

### 3.1 AI Model Integrity
| Verification Criterion | Expected State | Observed State | Result |
|---|---|---|---|
| Active Architecture | `YOLOv8s` (88.0% mAP50) sole active model | `ModelValidation.tsx:13,32,66`, `AUVTwin.tsx:278,320,1075,1422`, `GovernmentIntel.tsx:753` uniformly designate `YOLOv8s` | **PASS** |
| RT-DETR-L Isolation | Confined to ablation study failure baseline (35.4% mAP50) | In `ModelValidation.tsx:65,83,108` and `GovernmentIntel.tsx:453,455`, `RT-DETR-L` is strictly identified as the 35.4% mAP50 failure baseline due to data starvation | **PASS** |
| YOLOv9 Purge | Completely purged from all frontend files | `grep -rn "YOLOv9" src/` returned 0 results | **PASS** |

### 3.2 Hardware Architecture Integrity
| Verification Criterion | Expected State | Observed State | Result |
|---|---|---|---|
| Qualification Prototype BOM | Grounded in ESP32 DevKit v1 (₹400) + Raspberry Pi 4 4GB (₹4,500) = ₹6,100 INR | Specified in `AUVTwin.tsx:256-257, 970, 979, 1458, 1461`, `ModelValidation.tsx:44`, matching `HARDWARE.md` | **PASS** |
| Jetson Orin NX Demarcation | Explicitly marked as post-selection upgrade target; not in ₹6,100 BOM | In `AUVTwin.tsx:241-258`, tier is `MODULAR_UPGRADE`, labeled `(Post-Selection Upgrade)`, and desc states prototype uses Pi 4 | **PASS** |
| Raspberry Pi 4 in OceanState | Must specify Raspberry Pi 4 (4GB), not Pi 5 | `OceanState.tsx:498` displays `RASPBERRY PI 4 (4GB) / ONNX`; `grep -rn "Pi 5" src/` returned 0 results | **PASS** |

### 3.3 Economic Integrity
| Verification Criterion | Expected State | Observed State | Result |
|---|---|---|---|
| Headline Scale Unit Cost | ₹75,000 – ₹1,00,000 INR vs ₹25–30 Lakh commercial BGC-Argo float | Prominently displayed in `AUVTwin.tsx:970, 983`, `GovernmentIntel.tsx:522-524, 760`, `ResearchCitations.tsx:213` | **PASS** |
| SBE 3plus Authentic Comparison | SBE 3plus is ~₹1.5 Lakhs | Prose in `AUVTwin.tsx:75` specifies ₹1.5 Lakhs, BUT property `importedCostINR: 450000` in `AUVTwin.tsx:65` renders `₹4.5L` | **FAIL (Finding 1)** |
| Subsea AHRS Comparison | Grounded subsea AHRS comparison (~₹45,000) | Prose in `AUVTwin.tsx:115` specifies ₹45,000, BUT property `importedCostINR: 1800000` in `AUVTwin.tsx:105` renders `₹18.0L` | **FAIL (Finding 2)** |

### 3.4 Academic & Citation Purity
| Verification Criterion | Expected State | Observed State | Result |
|---|---|---|---|
| Philippe Blondel (2009) | Authentic Springer Praxis citation; no Urick mashup | `ResearchCitations.tsx:46-58` cites *The Handbook of Sidescan Sonar* (2009), DOI `10.1007/978-3-540-49886-5` | **PASS** |
| CLAHE Citation | Authentic Zuiderveld (1994) citation | `ResearchCitations.tsx:103-115` cites Graphics Gems IV, pp. 474–485, DOI `10.1016/B978-0-12-336156-1.50061-6` | **PASS** |
| CBAM Citation | Authentic Woo (2018) ECCV citation | `ResearchCitations.tsx:141-154` cites ECCV 2018, arXiv `1807.06521` | **PASS** |
| UNESCO EOS-80 Formulation | No fake Random Forest claims; authentic in-situ profile replay | `ResearchCitations.tsx:84-97` cites Fofonoff & Millard (1983) and describes cubic spline + gradient boosting | **PASS** |
| SAHI Framing | Roadmap architecture, not claimed as active runtime | `ResearchCitations.tsx:61-78` sets `isDirectlyImplemented: false` and badge `Phase 2 Roadmap: High-Resolution Sonar Slicing` | **PASS** |
| AI4Shipwrecks Accuracy | Acoustic shipwreck benchmark; no fabricated ghost net precision | `ResearchCitations.tsx:164-177` clarifies shipwrecks benchmark (89.6% AP50) vs CycleGAN ghost net transfer (82.1% AP50) | **PASS** |
| DeepScan Purge | All legacy "DeepScan" strings replaced with "AQUILA" | `grep -rn "DeepScan" src/` and `grep -rn "deepscan" src/` both returned 0 results | **PASS** |
| Monsoon & Energy Purge | No Indian Monsoon 98.4% LPA forecasting; no OTEC "Infinite Energy" | `grep -rni "monsoon" src/` returned 0 results; OTEC / Infinite Energy claims replaced by LiFePO4 polar battery architecture | **PASS** |
| Problem Statement Badge | Consolidated to official SIH `PS-26057` | Every `PS-` badge across `OceanState.tsx`, `GovernmentIntel.tsx`, `ResearchCitations.tsx` is strictly `PS-26057` | **PASS** |

### 3.5 Automated Tool Audits
| Command | Target Output | Actual Output | Status |
|---|---|---|---|
| `grep -rn "YOLOv9" src/` | 0 results | 0 results (exit 1) | **PASS** |
| `grep -rn "DeepScan" src/` | 0 results | 0 results (exit 1) | **PASS** |
| `grep -rn "deepscan" src/` | 0 results | 0 results (exit 1) | **PASS** |
| `grep -rn "PS-26065" src/` | 0 results | 0 results (exit 1) | **PASS** |
| `grep -rn "monsoon" src/` | 0 results | 0 results (exit 1) | **PASS** |
| `npx tsc --noEmit` | Exit code 0 | Exit code 0 (clean typecheck) | **PASS** |
| `npm run build` | Exit code 0 | Exit code 0 (dist generated in 1.15s) | **PASS** |

---

## 4. Adversarial Attack Surface & Stress-Testing

1. **Adversarial Scenario: Judge Clicks Sensor Breakdown in AUV Twin**
   - *Attack:* A technical evaluator or domain judge at SIH opens `AUVTwin.tsx` and clicks the "In-Situ Ocean Temperature Probe".
   - *Result:* The top metric card prominently states `GOVT IMPORT: ₹4.5L`. The judge immediately points out that a Sea-Bird SBE 3plus oceanographic temperature sensor costs ~$1,800 USD (~₹1.5 Lakhs), not ₹4.5 Lakhs. The judge reads the text right below it which states `Imported ₹1.5 Lakhs SBE 3plus`, creating an obvious credibility issue during live judging.
   - *Mitigation:* Change `importedCostINR: 450000` to `importedCostINR: 150000` so the card displays `₹1.5L`.

2. **Adversarial Scenario: IMU Gyroscope Comparison Scrutiny**
   - *Attack:* A robotics evaluator inspects the AHRS sensor card.
   - *Result:* The card displays `DEMO BOM: ₹150` vs `GOVT IMPORT: ₹18.0L` (100% saving) claiming to replace an iXblue Phins subsea fiber-optic gyro. A fiber-optic gyro is an ultra-high-grade navigation instrument used on nuclear submarines, whereas the MPU6050 is a ₹150 consumer accelerometer. The text claims it replaces a `₹45,000 commercial subsea AHRS module`.
   - *Mitigation:* Ground `importedCostINR` at `45000` and label it `Commercial Subsea MEMS AHRS Module`.

3. **Inference Latency Grounding**
   - *Tested:* `ModelValidation.tsx:48` claims `Inference Latency: ~180ms (~5.5 FPS) on Raspberry Pi 4 CPU (Edge ONNX Runtime) · >30 FPS with Coral/Hailo NPU`.
   - *Verification:* YOLOv8s on an ARM Cortex-A72 (Pi 4 quad-core) typically runs between 170ms and 220ms with ONNX Runtime float32/int8. Claim is grounded and realistic (no false claims of 60 FPS on bare CPU).

---

## 5. Required Remediations for Worker 2

To achieve **APPROVE** status, Worker 2 must apply the following single contiguous change in `frontend/src/pages/AUVTwin.tsx`:

```diff
--- a/frontend/src/pages/AUVTwin.tsx
+++ b/frontend/src/pages/AUVTwin.tsx
@@ -63,3 +63,3 @@
     componentCostINR: 80,
     importedEquivalent: 'Sea-Bird SBE 3plus Oceanographic Temp',
-    importedCostINR: 450000,
+    importedCostINR: 150000,
@@ -103,3 +103,3 @@
     componentCostINR: 150,
-    importedEquivalent: 'iXblue Phins Subsea Fiber-Optic Gyro',
-    importedCostINR: 1800000,
+    importedEquivalent: 'Commercial Subsea MEMS AHRS Module',
+    importedCostINR: 45000,
```

Once this 2-property alignment is applied, the UI cards will render `₹1.5L` and `₹0.5L` (or ₹45k), achieving 100% mathematical and narrative harmony across the entire application.
