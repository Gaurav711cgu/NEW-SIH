# Edge-Native Artificial Intelligence for Acoustic Debris Detection in Deep-Ocean Environments
**Technical Whitepaper | AQUILA OS | Smart India Hackathon 2026**

## Abstract
The autonomous detection of marine debris via Side-Scan Sonar (SSS) is severely constrained by acoustic data starvation, extreme speckle noise, and the hardware limitations of deep-sea Autonomous Underwater Vehicles (AUVs). This paper outlines the three core algorithmic innovations within the AQUILA OS platform: (1) An empirical ablation study proving the superiority of Convolutional Neural Networks (CNNs) over Vision Transformers (ViTs) for few-shot acoustic learning; (2) An acoustic shadow post-processing algorithm that reduces false positive detection rates by 88%; and (3) The deployment of micro-edge telemetry anomaly detection using IsolationForest algorithms on resource-constrained microcontrollers.

---

## 1. Algorithmic Ablation Study: YOLOv8s vs. RT-DETR

A critical challenge in underwater AI is the scarcity of high-resolution SSS datasets. To determine the most robust architecture for edge deployment, our team conducted a strict empirical ablation study on the *AI4Shipwrecks* dataset, heavily augmented with contrast-limited adaptive histogram equalization (CLAHE).

### 1.1 Transformer Failure in Data-Scarce Domains
We evaluated the RT-DETR-L (Vision Transformer) against the YOLOv8s (CNN). 
*   **RT-DETR-L (31.9M Parameters):** Achieved an mAP@50 of only **35.4%**.
*   **YOLOv8s (11.1M Parameters):** Achieved an mAP@50 of **88.0%**.

**Scientific Conclusion:** Vision Transformers lack spatial *inductive bias*. They process images globally and require massive datasets (>10,000 instances) to map relationships (Dosovitskiy et al., 2020). Conversely, CNNs inherently understand localized spatial features via sliding convolutions, making YOLO mathematically superior for few-shot learning in data-scarce acoustic environments. Furthermore, YOLOv8s achieved an inference latency of ~180ms (5.5 FPS) on edge CPU architecture, ensuring real-time capabilities without dedicated NPU hardware.

---

## 2. Acoustic Shadow Confidence Calibration

Standard AI models frequently mistake natural rock formations for artificial debris due to similar acoustic shadow profiles, leading to unacceptably high false alarm rates.

### 2.1 The Geometric Penalization Algorithm
AQUILA OS implements an acoustic shadow geometry post-processing layer based on *Blondel's Handbook of Sidescan Sonar (2009)*. 
1. The SSS image is passed through an adaptive binary thresholding filter to isolate high-intensity returns (objects) and low-intensity voids (shadows).
2. If the centroid of the YOLOv8 bounding box falls disproportionately inside an acoustic shadow zone, the raw confidence score is penalized ($P_{adj} = P_{raw} \times 0.6$).
3. Detections that fall below the deployment threshold but above the noise floor are flagged and routed to a **Human-in-the-Loop Triage Queue**.

**Result:** This deterministic calibration layer reduced field false positives from 28.4% to 3.2%, saving extensive human validation time.

---

## 3. Micro-Edge Telemetry Anomaly Detection

To ensure mission integrity during prolonged satellite communication blackouts (e.g., under Southern Ocean ice cover), the observation platform requires absolute hardware autonomy.

While the primary computer vision tasks are handled by a standard edge node (e.g., Raspberry Pi), AQUILA OS pushes critical anomaly detection directly to the sensory hub microcontroller (ESP32-WROOM-32). 

We trained a highly compressed **IsolationForest model**, exported it via ONNX runtime, and quantized it to **7 Kilobytes**. This model runs in real-time on the ESP32, parsing telemetry data streams (temperature, pressure, IMU pitch/roll) at 10Hz. It instantly detects sudden sensor deviations indicating physical damage, catastrophic leaks, or dangerous ice proximity, autonomously triggering a dive-and-hold "Comms Blackout" protocol before the main compute node is even queried.

---

## 4. Synthetic Sonar Data Generation Strategy

To solve the global shortage of annotated Ghost Net and debris sonar data, AQUILA OS includes a programmatic synthetic data generation engine. Instead of relying solely on expensive AUV deployments for training data, the engine utilizes standard optical maritime images and injects **Multiplicative Rayleigh Speckle Noise** to simulate acoustic backscatter interference, allowing rapid scaling of the CNN training sets.

## References
1. **Blondel, P. (2009).** *The Handbook of Sidescan Sonar.* Springer Praxis Books.
2. **Dosovitskiy, A., et al. (2020).** *An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale.* ICLR.
3. **Goodman, J.W. (1976).** *Some fundamental properties of speckle.* JOSA.
4. **University of Michigan Field Robotics Group.** *AI4Shipwrecks Dataset.*
