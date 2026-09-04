# AQUILA OS: Technology Choices & Antarctic Trade-Offs

## 1. Edge-AI Model Architecture
*   **The Standard Tool:** Mask R-CNN or YOLOv10 (Cloud/GPU-based).
*   **The Antarctic Problem:** Many competitors try to use massive models. The problem is power consumption. A GPU draws 200 Watts. In -2°C Antarctic water, draining the battery that fast means the AUV freezes and dies in 20 minutes.
*   **The AQUILA Choice:** YOLOv8s (quantized to INT8) + Custom Acoustic Shadow Filter.
*   **The Differentiator:** We aggressively quantized our model to run entirely on a 4-Watt Raspberry Pi 4 CPU. Because we save 196 Watts of power on compute, we can route that power to the battery heaters to keep the AUV alive in the freezing Southern Ocean.

## 2. Database & Data Storage
*   **The Standard Tool:** Cloud databases (MongoDB/Firebase) or Standard Consumer SD Cards.
*   **The Antarctic Problem:** There is no cloud underwater. Furthermore, standard consumer SD cards (TLC memory) become brittle and suffer catastrophic data corruption when the temperature drops below freezing. 
*   **The AQUILA Choice:** Local SQLite Database on Industrial SLC (Single-Level Cell) NAND Flash memory.
*   **The Differentiator:** SQLite requires zero server infrastructure and is ACID-compliant (won't corrupt if the AUV suddenly loses power). Combined with SLC memory, it guarantees our telemetry and AI reports survive -40°C.

## 3. The Communications Protocol
*   **The Standard Tool:** High-Bandwidth TCP/IP (Sending raw images to the surface via Starlink/VSAT).
*   **The Antarctic Problem:** High-bandwidth VSAT antennas are massive, heavy, and cost lakhs of rupees per minute. Small AUVs cannot carry them. 
*   **The AQUILA Choice:** Iridium SBD (Short Burst Data) + MQTT Protocol.
*   **The Differentiator:** We compress the entire intelligence of the mission into a 2-Kilobyte JSON string. Iridium SBD allows us to use a tiny, cheap antenna to burst that JSON string to the satellite the moment the AUV surfaces, costing ₹12 per transmission instead of ₹5,000.

## 4. The Dashboard Architecture (Frontend)
*   **The Standard Tool:** WebSockets connected to AWS/GCP (Standard SaaS model).
*   **The Antarctic Problem:** Research vessels like the *Sagar Nidhi* face massive satellite internet latency (high ping) and frequent dropouts due to polar storms. A standard cloud dashboard will crash or endlessly load.
*   **The AQUILA Choice:** Decoupled React Frontend + Local FastAPI Backend (Air-Gapped Architecture).
*   **The Differentiator:** The entire AQUILA OS dashboard runs locally on the laptop inside the research vessel. It requires absolutely zero internet to operate. It is a true military-grade, air-gapped command center.
