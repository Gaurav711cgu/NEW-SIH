# SIH Q&A Defense Strategy: The Domain Gap

When the judges ask: *"How can you claim 0-6 hour accuracy when you trained on US data (SEVIR)? Indian weather patterns like the monsoon and Kalbaisakhi are completely different."*

### DO NOT DEFEND THE 6-HOUR CLAIM. DO THIS INSTEAD:

**1. Acknowledge and Validate Immediately:**
> *"You are absolutely right. Claiming high accuracy at 4 to 6 hours using a model trained on US Great Plains convection would be scientifically irresponsible. The terrain forcing of the Western Ghats and the moisture dynamics of the Bay of Bengal are fundamentally different from NEXRAD supercell morphology."*

**2. Explain the Split-Architecture (The Pivot):**
> *"Because of that exact domain gap, our system architecture strictly splits the 0-6 hour mandate into two arms:*
> 
> * **The 0–2 Hour Tactical Window (Production Ready):** For this window, we rely heavily on `pysteps` (Optical Flow), fused with our AI's real-time lightning detection. Because optical flow tracks physical pixels rather than relying on deep learned climatology, it is highly reliable in India right now.*
> 
> * **The 2–6 Hour Strategic Window (Research Arm):** Past 2 hours, optical flow degrades below climatology. This is where our ConvLSTM/Deep Learning architecture kicks in. However, we explicitly label this in our UI as an **'Experimental Research Arm'** with low confidence. We built the PyTorch architecture so that the MoES can plug in their historical DWR datasets to fine-tune it for Indian cases like Kalbaisakhi events."*

**3. Point to the UI (The Kill Shot):**
> *"If you look at our Confidence HUD, you'll see we actually built an 'ETA Confidence Decay' warning. If the forecast pushes past 120 minutes, the system automatically flags a **Domain Gap Warning** and reduces confidence, ensuring authorities don't make critical evacuations based on uncalibrated long-term ML."*

### Why this wins:
Other teams will blindly defend their AI and say it's 95% accurate. The judges (actual scientists) will know they are lying. By admitting the limitation and building a fallback (`pysteps` for 0-2h) and a UI warning for 2-6h, you prove you are thinking like an actual disaster management engineer.
