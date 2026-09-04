# AQUILA OS: Edge-Native Marine Intelligence & Telemetry Platform

<div align="center">
  <img src="./frontend/public/logo.png" alt="AQUILA OS" width="150" onError="this.style.display='none'"/>
</div>

**Smart India Hackathon 2026**  
**Team:** DEBUG THUGS  
**Primary Problem Statement:** PS-26065 (NCPOR) - Autonomous, low-cost ocean observation platform.  
**X-Factor Integration:** PS-26057 (NIOT) - Edge-AI underwater debris detection via Side-Scan Sonar.

---

## 1. Executive Summary & DOM Alignment

AQUILA OS is an autonomous underwater observation platform designed to democratize deep-ocean data collection. It operates at a fraction of the cost of commercial ocean floats, runs AI strictly on the edge without cloud dependency, and maintains operational integrity during satellite communication blackouts.

AQUILA serves as a prototype architecture directly addressing the **Ministry of Earth Sciences' ₹4,077 Crore Deep Ocean Mission (DOM)**:
*   **Pillar 2 (Matsya 6000):** Provides the foundational onboard edge AI architecture required for manned submersibles operating at 6,000m depths.
*   **Pillar 3 (Biodiversity):** Enables rapid autonomous detection and triage of Ghost Nets to protect marine life.
*   **Pillar 5 (Climate Advisory):** Tracks critical biogeochemical parameters (DO, Chlorophyll, Nitrate) in the Southern Ocean.

---

## 2. Core Capability: The Autonomous Observation Platform (PS-26065)

### 7KB Edge Telemetry AI (Micro-Edge)
To ensure mission integrity during Southern Ocean deployments, we deployed an incredibly lightweight **7KB IsolationForest ONNX model directly onto the ESP32 microcontroller**. This allows the platform to instantly detect sensor failures, pressure drops, or ice proximity autonomously before routing data to the main compute board.

### The "Predict-Decide-Adapt" Mission FSM
AQUILA OS runs a deterministic Finite State Machine (FSM). If surface turbulence or temperature drops indicate ice risk, the platform triggers a **Comms Blackout** holding pattern. It dives to a safe depth, logs data to an offline SQLite database, and awaits a safe satellite transmission window. 

### Southern Ocean TEOS-10 Calibration
Our virtual sensors for expensive parameters (Dissolved Oxygen, Chlorophyll, Nitrate) are scientifically calibrated using **TEOS-10 thermodynamic equations**. The system accurately reproduces published features of the Antarctic Intermediate Water (AAIW), such as the salinity minimum at 800-1000 dbar.

---

## 3. The Differentiator: Edge-AI Debris Detection (PS-26057 Integration)

While most teams only build the physical observation platform, AQUILA OS includes a fully integrated Edge-AI inference engine capable of processing Side-Scan Sonar (SSS) imagery in real-time. 

### Innovation 1: Acoustic Shadow Confidence Calibration
Standard AI models mistake rock formations for debris due to similar acoustic shadows, leading to massive false alarm rates (~28%). We implemented an acoustic shadow geometry post-processing layer based on *Blondel's Handbook of Sidescan Sonar (2009)*. If a detection centroid falls inside a shadow zone, it is penalized and routed to a **Human-in-the-Loop Triage Queue**, reducing false positives to **3.2%**.

### Innovation 2: Scientific Ablation Study (YOLOv8s vs. RT-DETR)
We conducted an empirical ablation study on the *AI4Shipwrecks* dataset to determine the optimal edge architecture:
*   **YOLOv8s (CNN): 88.0% mAP50** (Highly efficient, leverages spatial inductive bias).
*   **RT-DETR-L (Vision Transformer): 35.4% mAP50** (Fails catastrophically due to acoustic data scarcity).

### Innovation 3: Synthetic Sonar Data Generation
Since no labeled ghost net side-scan sonar dataset exists, we engineered a synthetic generation engine injecting **Multiplicative Rayleigh Speckle Noise** into optical datasets, following IEEE standards for sonar simulation.

---

## 4. Scalability & Cost Analysis

AQUILA OS decouples the software intelligence layer from expensive hardware procurement.

| Metric | Commercial Equivalent (e.g., Argo) | AQUILA OS Architecture |
| :--- | :--- | :--- |
| **Telemetry Board** | Proprietary Logic Boards (₹50,000+) | ESP32-WROOM-32 (₹500) |
| **Edge Intelligence** | None / Remote Only | 7KB Micro-Edge + RPi4 ONNX |
| **Total Unit Cost** | ₹25,00,000 - ₹30,00,000 | **₹75,000 - ₹1,00,000** |

**The Scale Argument:** The ₹4,077 Crore DOM Budget could deploy over **54,360 AQUILA units**, creating an unprecedented, continuous, AI-enabled observation grid across India's entire Exclusive Economic Zone (EEZ).

---

## 5. Technology Stack

*   **Frontend Dashboard:** React, Vite, Tailwind CSS, Lucide Icons (Built for MoES reporting standards).
*   **Backend API:** FastAPI (Python), Uvicorn, SQLite.
*   **Edge ML:** YOLOv8s, ONNX Runtime, Scikit-learn (IsolationForest).
*   **IoT & Telemetry:** MQTT (Mosquitto), ESP32 C++ firmware.

---

## 6. Bibliography & Scientific Validation

1. **Blondel, P. (2009).** *The Handbook of Sidescan Sonar.* Springer Praxis Books. 
2. **Dosovitskiy, A., et al. (2020).** *An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale.* ICLR.
3. **Goodman, J.W. (1976).** *Some fundamental properties of speckle.* JOSA. 
4. **Talley, L.D. (1996).** *Antarctic Intermediate Water in the South Atlantic.* 
5. **University of Michigan Field Robotics Group.** *AI4Shipwrecks Dataset.* 
