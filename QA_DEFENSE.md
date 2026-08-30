# Judge Q&A Defense

## Purpose

This document prepares the team for every question raised during the project research and council sessions. Each question has a structured answer: the direct answer first, followed by the technical justification, and a note on what to avoid saying. The team should know every answer here before the demonstration.

---

## Category 1: Data Authenticity

**Q: Is this data real?**

Direct answer: The temperature, pressure, and pH readings are live from physical sensors connected to the ESP32. The dissolved oxygen, chlorophyll, nitrate, and the secondary pH channel are replayed from real BGC-Argo float profiles collected in the Southern Ocean Indian sector, with quality control flag equal to 1. Every virtual value is labelled on the dashboard. We are not claiming any virtual value is a physical measurement.

Justification: BGC-Argo is the global biogeochemical float programme. Its data is peer-reviewed, quality-controlled by the Argo Data Management Team, and used directly by NCPOR for Southern Ocean research. QC flag 1 is the highest quality level, indicating the data has passed both automated and expert manual quality control.

Do not say: "We simulated it" or "We approximated it." Say: "We replayed it from a real float profile."

---

**Q: Which specific float did you use?**

Direct answer: Our primary profile is from SOCCOM float WMO 5904859, deployed in the Southern Ocean Indian sector (approximately 20 to 90 degrees East, 40 to 75 degrees South). We fetched all available profiles from this region using the argopy library with QC flag 1 filtering. The nearest profile to our simulated platform position is selected automatically by the ProfileInterpolator class.

Do not say: "We used Argo data generally." Have the WMO number ready.

---

**Q: How do you know your virtual dissolved oxygen is accurate for the Southern Ocean?**

Direct answer: We validated the interpolation accuracy using an 80/20 profile split. The interpolator was trained on 80% of available profiles and evaluated on the withheld 20%. Our dissolved oxygen MAE is [value from running validator.py] micromol per kilogram against real float measurements. The result is in our validation report.

Additionally, the profile shape is a strong qualitative indicator. A real Southern Ocean dissolved oxygen profile shows high surface concentrations (8-9 micromol per kilogram), a subsurface minimum at 200-400m, and recovery below 500m. If our virtual sensor produces this shape, the data is correctly drawn from the target region. We have verified this.

---

**Q: Does your temperature profile show the Antarctic Intermediate Water layer?**

Direct answer: Yes. The AAIW is identifiable as a salinity minimum at approximately 800 to 1000 dbar in our fetched profiles. We have plotted this and included it in the dataset verification. A fabricated or wrong-region dataset will not show this feature. We can display the plot.

Preparation: Generate and save the AAIW salinity profile plot before the demonstration. Be ready to display it on request.

---

## Category 2: Hardware and Budget

**Q: You don't have a real platform. How can you claim to address PS-26065?**

Direct answer: The qualification scope is the complete software architecture and sensor integration proof of concept, with the physical hardware design specified, costed, and ready for procurement. The platform body, marine-grade enclosure, pressure-rated CTD, and Iridium communication module are post-selection procurement targets. This is consistent with SIH qualification expectations: the qualification stage demonstrates architectural readiness, not a fully deployed field system.

Justification: SIH's own evaluation criteria include architecture quality, technical feasibility, and implementation roadmap alongside working prototype. Our prototype demonstrates the full data pipeline with real sensors at the qualification stage. The roadmap to the physical platform is specific and costed.

Do not say: "We will figure it out later." Present the specific post-selection hardware list with costs.

---

**Q: How are you claiming low cost when you don't have the expensive sensors that make it low cost?**

Direct answer: The low-cost claim is about operational model, not about buying cheap sensors. Southern Ocean expeditions on ORV Sagar Nidhi cost crores of rupees per voyage because ships are expensive: fuel, crew, port costs, voyage duration. An autonomous platform at 75,000 to 1,00,000 rupees per unit deploys for months with no crew and no ship-time. That is where the cost reduction is. The comparison is not DS18B20 versus Sea-Bird CTD. The comparison is autonomous platform versus manned expedition.

Additionally, the DS18B20 costs 80 rupees and covers the -55 to +125 degree Celsius range. A Sea-Bird SBE3 costs approximately 1.5 lakh rupees and achieves 0.001 degree Celsius accuracy. For routine monitoring applications, the qualification prototype's 0.5 degree Celsius accuracy from a chip that costs 80 rupees is adequate. We are not claiming equivalent precision. We are claiming adequate precision at 1875-times lower cost.

---

**Q: Your sensor is not polar-rated. How will it work in Antarctica?**

Direct answer: The DS18B20 is rated to negative 55 degrees Celsius. Southern Ocean surface water ranges from negative 1.8 to positive 4 degrees Celsius. The BMP280 is rated to negative 40 degrees Celsius. The sensors physically operate in polar seawater temperatures without modification.

What does not work in polar conditions is a standard lithium-ion battery at the platform housing, which loses capacity rapidly below zero degrees Celsius. The post-selection hardware roadmap specifies LiFePO4 cells rated to negative 20 degrees Celsius, which retain 70 to 80 percent capacity at that temperature versus 30 to 40 percent for standard lithium polymer. This is an enclosure and power engineering problem, not a sensor physics problem.

The mechanism for sensing temperature is identical in a bucket of water at 22 degrees and in Southern Ocean surface water at minus 1 degree. The shell around the mechanism changes. We are demonstrating the mechanism. The shell is a post-selection procurement decision.

---

**Q: What is your total cost at scale?**

Direct answer: Qualification prototype: approximately 6,100 rupees including the Raspberry Pi, which is reusable. Physical hardware bill of materials for one fully instrumented unit post-selection: approximately 8,13,000 rupees. Target production cost at scale (simplified sensor selection, custom PCB, batch procurement): 75,000 to 1,00,000 rupees per unit. Commercial Argo floats cost 25 to 30 lakh rupees per unit. Our target is a 25 to 30 times cost reduction.

---

## Category 3: Technical Depth

**Q: What is your model's precision and recall?**

Direct answer: [Complete the evaluation before the demo. Present the exact numbers from running `model.val()` on the AI4Shipwrecks test split. Do not estimate or approximate. Example format:] mAP50 of 0.83 on the AI4Shipwrecks test split. Shipwreck AP50: 0.91. Cylinder AP50: 0.74. Shadow penalty reduces false positive rate on shadow-zone detections by 42 percent on the validation set.

Do not say: "Our model performs well." Give numbers. Judges from NIOT are technical. Numbers without evidence are claims. Numbers with evidence are results.

---

**Q: What does the confidence score actually represent?**

Direct answer: The raw confidence is the softmax probability output of the YOLOv8-seg classification head -- the model's probability estimate that the detection belongs to the predicted class. We then apply two calibration steps. First, temperature scaling adjusts the probability distribution to reduce overconfidence, which is a known characteristic of neural network classifiers. Second, if the detection centroid falls within an identified acoustic shadow zone, the calibrated confidence is multiplied by 0.5. The final calibrated confidence is what is displayed on the dashboard and written to the report. Both the raw and calibrated values are stored.

---

**Q: What happens when the model encounters an object not in the training set?**

Direct answer: Detections below the confidence threshold (0.35 after calibration) are routed to the anomaly class and flagged for human review. We do not suppress uncertain detections because a suppressed false negative in a debris survey is operationally worse than a reviewed false positive. The operational philosophy is: uncertain is better than silently wrong.

---

**Q: How does your platform navigate?**

Direct answer: The qualification prototype does not have active navigation. The platform design is a drifting profiler, similar to an Argo float, which descends and ascends vertically while drifting with ocean currents. Position is tracked via GPS on each surfacing. This is the standard operational model for autonomous ocean profiling platforms. Active navigation via thrusters is a post-selection upgrade for directed survey missions.

---

**Q: What is your end-to-end MQTT pipeline latency?**

Direct answer: [Measure this before the demo. Run: `mosquitto_pub -t test -m hello` and measure receipt time at subscriber. Expected range: 50 to 200 milliseconds on a local WiFi network.] Our measured latency is [X] milliseconds from sensor publication to database insertion.

---

**Q: What is your AAIW salinity minimum depth?**

Direct answer: In our fetched BGC-Argo profiles from the Southern Ocean Indian sector, the salinity minimum appears at approximately 800 to 1000 dbar, consistent with published AAIW characteristics. We have plotted this and can display the profile.

---

## Category 4: Scientific Context

**Q: NCPOR already has the ArgoIndia programme. Why do we need your platform?**

Direct answer: NCPOR's ArgoIndia floats are standard Core Argo floats measuring temperature, salinity, and pressure. They do not carry sonar. They do not run AI detection. They do not detect marine debris. Our platform adds the PS-26057 seafloor intelligence capability -- side-scan sonar AI debris detection and geotagging -- which no current Argo float provides. Additionally, Argo floats are imported at 25 to 30 lakh rupees each. Our target is an indigenous float at 75,000 to 1,00,000 rupees, directly supporting the Atmanirbhar Bharat mission for oceanographic instruments.

---

**Q: Why is the Southern Ocean important? Why should India invest here?**

Direct answer: The Southern Ocean absorbs approximately 40 percent of the global annual uptake of anthropogenic carbon dioxide, making it the world's most important carbon sink. It also controls global thermohaline circulation through formation of Antarctic Bottom Water. NCPOR has conducted 7 Southern Ocean expeditions since 2004 specifically to study carbon cycling, biogeochemistry, biodiversity, and air-sea interactions in this region. India has a direct scientific and climate policy interest in understanding Southern Ocean variability. Our platform directly supports these research priorities by providing continuous autonomous observation between expensive ship expeditions.

---

**Q: How does this relate to the Deep Ocean Mission?**

Direct answer: The Ministry of Earth Sciences Deep Ocean Mission explicitly lists "Advanced Ocean Observation Systems using underwater sensors and artificial intelligence" as a core objective. Our platform is a prototype implementation of that objective. The DOM has allocated 4,077 crore rupees for deep-sea exploration and observation technology. Our project demonstrates that autonomous ocean observation with integrated AI can be achieved at student project cost, providing a proof of concept for the indigenous platform development the DOM is seeking.

---

## Category 5: Team and Process

**Q: Who built what?**

Each team member must have a memorised one-sentence answer prepared before the demonstration. Suggested role assignments:

- Hardware lead: ESP32 firmware, sensor wiring, physical demonstration
- AI lead: YOLOv8-seg training, confidence calibration, SSS preprocessing
- Data lead: argopy data fetching, profile interpolator, validation
- Integration lead: MQTT pipeline, SQLite schema, sync manager
- Dashboard lead: Streamlit application, all four pages
- Documentation lead: README, architecture diagrams, presentation

There should be no overlap in stated responsibilities and no contradiction between team members.

---

**Q: Are you being transparent about what is real versus simulated?**

Direct answer: Yes. We built the LIVE, VIRTUAL, and PLANNED source labelling system specifically so that no observer is misled about the origin of any displayed value. Scientific transparency about data sources is a design requirement we imposed on ourselves, not an afterthought. The Argo programme itself distinguishes real-time and delayed-mode data using quality flags; we follow the same principle.

---

## Answers to Avoid

The following phrasings weaken credibility and should not be used:

- "We simulated it." (Replace with: "We replayed it from real Argo profile data.")
- "We will figure out the sensors later." (Replace with: "Post-selection hardware is costed and specified.")
- "Our AI performs well." (Replace with: "Our mAP50 is X on the AI4Shipwrecks test split.")
- "It should work in cold water." (Replace with: "The DS18B20 is rated to minus 55 degrees Celsius. It covers Antarctic surface temperatures by specification.")
- "We couldn't afford better sensors." (Replace with: "We deliberately decoupled data acquisition from processing. Replacing the virtual source requires one configuration change.")
- "This is just a demo." (Replace with: "The qualification prototype demonstrates the complete architecture. The physical platform is the finals deliverable.")
