Milestone 1 — Radar → Detect a Storm Cell
The official PS specifically requires DWR reflectivity and velocity fields, but for the first milestone, we should start with reflectivity only because detection of the storm region can be built from it.   Pasted markdown
Goal
Take one radar scan and automatically answer:
“Is there a significant convective region here, and where is it?”

Output:
Cell A17
Center: (lat, lon)
Area: XX km²
Max reflectivity: XX dBZ

Step 1 — Get one radar source
Prefer:
DWR numerical reflectivity

If we don't have access yet:
IMD radar reflectivity image

For Milestone 1, don't worry about live data yet.
Use one real historical radar case first.
Step 2 — Convert radar input into something our program can process
Numerical route
DWR
 ↓
reflectivity array
 ↓
clean invalid values
 ↓
geographic grid

Image route
Radar image
 ↓
remove legend/UI
 ↓
map colors → reflectivity ranges
 ↓
georeference
 ↓
reflectivity-like grid

The image route is a fallback, not our preferred quantitative route.
Step 3 — Detect strong radar regions
Start simple.
Example:
Reflectivity

22  25  31  48
24  35  46  52
20  30  49  56
18  22  34  41

Create a mask:
strong echo
= 1

weak echo
= 0

Example:
0 0 0 1
0 0 1 1
0 0 1 1
0 0 0 0

The exact threshold should eventually be determined from validation rather than arbitrarily declared as the scientific definition of a convective cell.
Step 4 — Group connected pixels
Now:
binary mask
     ↓
connected-component analysis
     ↓
Region 1
Region 2
Region 3

Remove tiny isolated regions.
Conceptually:
      ████
    ███████
   ████████
    ██████

    Region 1

Step 5 — Create our first cell object
Once a region is identified:
CELL A17
──────────────
center
area
bounding box
max reflectivity
mean reflectivity
timestamp

Example:
CELL A17

Center:
20.31°N, 85.84°E

Area:
126 km²

Max reflectivity:
54 dBZ

Time:
14:20 IST

A17 is our software's ID, not something provided by the radar.
Step 6 — Put it on a map
This is where the first visible result comes.
              Odisha

      ┌────────────────────┐
      │                    │
      │       █████        │
      │      ███████       │
      │      ███████       │
      │        ● A17       │
      │                    │
      └────────────────────┘

Clicking A17 should show:
CELL A17
Center: ...
Area: ...
Max Z: ...
Time: ...

Step 7 — Test on several radar scans
Don't stop with one image.
Use:
T0
T+10
T+20
T+30

At this milestone we still don't track the cell.
We're simply checking:
Does the detector correctly find
the storm region in each scan?

Step 8 — Validate detection
Create a small manual ground-truth set.
For example, manually mark:
Actual storm region

and compare:
Our detected region
        vs
Manually verified region

Use simple measures such as:
IoU
precision
recall

The purpose here is to establish that our detector works, before adding tracking.
Milestone 1 deliverable
At the end, you should be able to run:
radar_scan.png / radar_data
        ↓
preprocessing
        ↓
storm-region detection
        ↓
CELL A17
        ↓
GIS map

And see:
┌──────────────────────────────────┐
│        RADAR CELL DETECTOR       │
│                                  │
│        █████                     │
│      █████████                   │
│     ███████████                  │
│        ● A17                     │
│                                  │
├──────────────────────────────────┤
│ Cell A17                         │
│ Area: 126 km²                    │
│ Max Reflectivity: 54 dBZ         │
│ Time: 14:20 IST                  │
└──────────────────────────────────┘

What we do NOT build yet
❌ Cell tracking
❌ Speed/direction
❌ Lightning fusion
❌ Satellite fusion
❌ NWP
❌ Hail prediction
❌ Downburst
❌ Cloudburst
❌ 0–6 h forecasting
❌ ETA

Those come later.
Milestone 1 success condition
We should not move to Milestone 2 until:
Given a radar scan, our system can reliably identify the major storm/convective regions and represent each region as a geographic cell object.

Then Milestone 2 becomes:
CELL A17 at T
        ↓
CELL A17 at T+10
        ↓
CELL A17 at T+20
        ↓
movement + speed + direction

So Milestone 1 = “See the storm.”
Milestone 2 = “Follow the storm.”

Milestone 2 — Follow the Storm
Milestone 1 was:
Radar scan → detect a storm region → create Cell A17.

Milestone 2 is:
Successive radar scans → recognize it is the same cell → calculate where it is moving, how fast, and in which direction.

This builds directly on the cell concept required for our nowcasting system. The official PS requires automatic convective initiation and short-term dynamic forecasting, though it does not prescribe a particular tracking algorithm.   Pasted markdown
1. Inputs
We now need multiple scans:
T0       → radar scan
T+10min  → radar scan
T+20min  → radar scan
T+30min  → radar scan

Each scan goes through Milestone 1:
Radar
 ↓
storm detection
 ↓
Cell objects

2. Match the cells between scans
Example:
10:00                 10:10

   ███                  ███
 ███████              ███████
  █████                █████
    ● A17                ● ?

Our tracker determines:
“The second region is probably the same Cell A17.”

We can initially use a simple combination of:
distance between centroids
+
overlap of cell regions
+
similarity of size/shape

Don't jump to a complicated AI tracker yet.
3. Calculate movement
Suppose:
10:00
A17 = 20.30°N, 85.80°E

10:10
A17 = 20.35°N, 85.86°E

We calculate the geographic displacement.
Then:
speed = distance / time

and determine:
direction = movement bearing

Output:
CELL A17

Speed: 41 km/h
Direction: NE

4. Build Cell A17's history
Instead of storing only the latest location:
A17 = current position

store:
A17
├── 10:00 → position A
├── 10:10 → position B
├── 10:20 → position C
└── 10:30 → position D

Now we can calculate trends.
5. Add movement visualization
The map should show:
               T+30
                 ●
                /
          T+20 ●
              /
        T+10 ●
            /
       NOW ●

And the current cell:
       ███████
      █████████
       ███████
          ● A17

So the judge can immediately understand:
This is one storm moving through the region.

6. Calculate movement statistics
For each cell maintain:
Current position
Speed
Direction
Previous position
Acceleration/change in speed
Track length
Age

Also record detection confidence.
Example:
CELL A17
────────────
Age: 30 min
Speed: 41 km/h
Direction: NE
Movement confidence: 0.91

The numbers are examples; actual values come from the implementation.
7. First prediction
Now we can make our first basic nowcast.
Suppose:
Current:
20.35 N, 85.86 E

Speed:
41 km/h

Direction:
NE

We project its recent motion forward:
T+10 → predicted position
T+20 → predicted position
T+30 → predicted position
T+60 → predicted position

Visualization:
NOW
 ●
  \
   ● +10
     \
      ● +20
        \
         ● +30
           \
            ● +60

Important:
This is a baseline motion extrapolation, not yet our final AI forecast.
It gives us something extremely valuable:
a baseline to beat later.

8. Validate the tracker
For historical storms:
Observed cell at T
        ↓
our tracker predicts position at T+10
        ↓
actual cell position at T+10
        ↓
calculate error

Example:
Predicted: 20.35, 85.86
Actual:    20.34, 85.87

Track error: X km

Repeat across many scans/events.
Milestone 2 deliverable
By the end, we should have:
Radar T0
    ↓
Cell A17
    ↓
Radar T+10
    ↓
same A17 identified
    ↓
Radar T+20
    ↓
same A17 identified
    ↓
trajectory
    ↓
speed + direction
    ↓
basic future path

And the dashboard:
┌────────────────────────────────────┐
│          STORM TRACKER             │
│                                    │
│        ███████                     │
│       █████████                    │
│        █████                       │
│           ● A17                    │
│            \                       │
│             \                      │
│              ● T+20                │
│                \                   │
│                 ● T+30             │
│                                    │
├────────────────────────────────────┤
│ Cell A17                           │
│ Speed: 41 km/h                     │
│ Direction: NE                      │
│ Age: 30 min                        │
│ Tracking confidence: 91%           │
└────────────────────────────────────┘

What Milestone 2 means
Milestone 1:  
“I can see a storm.”

Milestone 2:  
“I know which storm it is, where it is going, and how fast it is moving.”

Milestone 3 — Understand the Storm
Now we move from:
Milestone 1: See the storm
Milestone 2: Follow the storm  
to:
Milestone 3: Is Cell A17 strengthening, weakening, or staying stable?

This is the first point where our system starts becoming convective intelligence rather than just storm tracking.
1. We compare A17 over time
Suppose:
Time       Reflectivity     Area       Lightning
14:00          42 dBZ        80 km²       5/min
14:10          47 dBZ       100 km²      12/min
14:20          53 dBZ       130 km²      24/min

The system sees:
Reflectivity ↑
Area ↑
Lightning ↑

Therefore:
CELL A17
STATUS = INTENSIFYING

2. Create a Cell Evolution State
For every cell we maintain:
CELL A17
──────────────
Position
Speed
Direction

Reflectivity
Reflectivity trend

Area
Area growth rate

Lightning rate
Lightning trend

Age
Confidence

Status:
Developing
Intensifying
Mature
Weakening

This becomes the cell's current state.
3. Add satellite information
Now we add INSAT.
Instead of only:
Radar → A17

we also observe cloud evolution.
Conceptually:
Radar
  ├─ intensity ↑
  └─ area ↑

Lightning
  └─ rate ↑

INSAT
  └─ thermal/cloud evolution ↑

All three contribute evidence that the storm is changing.
4. Produce an evolution score
For the prototype, we can create a model such as:
                CELL EVOLUTION MODEL

Radar features
Lightning features
Satellite features
Ground/NWP features
        ↓
      ML model
        ↓
  Evolution state

Output:
A17

Developing      0.08
Stable          0.12
Intensifying    0.80
Weakening       0.10

Those numbers are illustrative; the actual probabilities come from training.
5. This is much better than one rule
We DON'T do:
Reflectivity > X
    ↓
SEVERE

We look at change over time:
What was A17 doing 20 min ago?
What is it doing now?
Is the rate of change increasing?

For example:
42 → 47 → 53 dBZ

is more informative than simply:
53 dBZ

because the storm is evolving.
6. The UI should show this visually
Click A17:
┌──────────────────────────────┐
│ CELL A17                     │
├──────────────────────────────┤
│ Status:  INTENSIFYING ↑      │
│ Speed:   41 km/h             │
│ Direction: NE                │
│                              │
│ Reflectivity                 │
│ 42 → 47 → 53 dBZ            │
│                              │
│ Lightning                    │
│ 5 → 12 → 24 / min           │
│                              │
│ Area                         │
│ 80 → 100 → 130 km²          │
└──────────────────────────────┘

And a small chart:
Intensity
 60 |                    ●
 50 |              ●
 40 |        ●
    └────────────────────────
       14:00  14:10  14:20

7. Now we can make a better prediction
Milestone 2 used:
Current position
+
speed
+
direction

to extrapolate the storm.
Milestone 3 adds:
How is the storm changing?

So:
POSITION
+
MOTION
+
EVOLUTION
        ↓
BETTER TRAJECTORY / FUTURE STATE

For example:
A17 is moving NE
AND
A17 is rapidly intensifying

Our future hazard footprint shouldn't simply be the same-size blob moving NE.
Instead:
NOW
   ███
 ███████

T+30
   █████
 █████████

T+60
 ███████
██████████

The predicted storm can grow as it moves.
8. This is the foundation for the hazard models
Now the later models can use:
Current state
+
Evolution
+
Movement

to predict:
Lightning
Hail
Downburst
Cloudburst

So the pipeline becomes:
M1
Detect
 ↓
M2
Track
 ↓
M3
Understand evolution
 ↓
M4
Multimodal fusion
 ↓
Hazard prediction

9. Validate Milestone 3
Again use historical storms.
At each time:
T
 ↓
calculate evolution
 ↓
predict whether cell strengthens/weakens
 ↓
look at what actually happened at T+10/T+20

Then measure:
Did intensifying cells actually intensify?
Did weakening cells actually weaken?

This gives us a measurable evolution model before moving to hazard prediction.
Milestone 3 success condition
We should be able to show:
Radar + Lightning + Satellite
             ↓
          CELL A17
             ↓
     current evolution
             ↓
┌──────────────────────────┐
│ INTENSIFYING             │
│ Reflectivity: ↑          │
│ Lightning: ↑             │
│ Area: ↑                  │
└──────────────────────────┘

Milestone 4 — Multimodal Fusion
Now we have:
M1: Detect the storm
M2: Track the storm
M3: Understand whether it is strengthening/weakening  
Now:
M4 = combine all available evidence about the SAME storm into one unified state.

The official PS specifically requires fusion of DWR, INSAT and lightning observations.
1. Before fusion
We have separate information:
RADAR
A17 → 53 dBZ, moving NE, growing

LIGHTNING
A17 → 24 strikes/min, increasing

SATELLITE
A17 → cloud/thermal evolution detected

NWP / GROUND
A17 → environmental conditions

Individually, each source gives only part of the story.
2. Match everything to Cell A17
We don't combine the entire Odisha map blindly.
We ask:
Which radar region = A17?
Which lightning strikes belong to A17?
Which satellite region overlaps A17?
What NWP conditions exist around A17?

Then create:
CELL A17
──────────────
Radar features
Lightning features
Satellite features
NWP/ground features

3. Create the unified Cell State
Example:
CELL A17

Position       20.31, 85.84
Speed          42 km/h
Direction      NE

Radar
Reflectivity  53 dBZ
Growth        +18%

Lightning
Rate          24/min
Trend         ↑

Satellite
Cloud evolution ↑

Environment
Instability    High

Now the system has one representation of the storm.
4. Feed that into a fusion model
Radar ──────────┐
Lightning ──────┤
Satellite ──────┤
NWP/Ground ─────┘
         ↓
   FUSION MODEL
         ↓
   Cell A17 state

Output might be:
Developing       0.05
Stable           0.08
Intensifying     0.84
Weakening        0.03

The numbers are illustrative.
5. Why fusion is powerful
Case A
Radar ↑
Lightning ↑
Satellite evolution ↑
NWP favorable

→ strong evidence of intensification.
Case B
Radar strong
BUT
Lightning ↓
Satellite stable
NWP unfavorable

→ don't blindly assume the storm will intensify.
That's the purpose of fusion.
6. Handle missing data
This is essential for a real system.
Radar ✓
Lightning ✓
Satellite ✗
NWP ✓

The model should still work:
available evidence
      ↓
fusion
      ↓
confidence reduced

Never invent the missing satellite observation.
7. What the UI shows
Click A17:
┌──────────────────────────────┐
│ CELL A17                     │
├──────────────────────────────┤
│ STATUS: INTENSIFYING ↑       │
│                              │
│ RADAR                        │
│ 53 dBZ   Growth ↑           │
│                              │
│ LIGHTNING                    │
│ 24/min   Trend ↑             │
│                              │
│ SATELLITE                    │
│ Cloud evolution ↑            │
│                              │
│ ENVIRONMENT                  │
│ Favorable                    │
│                              │
│ Confidence: HIGH             │
└──────────────────────────────┘

8. M4 success condition
We should be able to say:
“For every detected storm cell, we maintain one continuously updated state containing evidence from multiple meteorological sources.”

Milestone 5 — Hazard Prediction
Now we have:
M1: Detect the stormM2: Track itM3: Understand its evolutionM4: Fuse radar + lightning + satellite + NWP/ground
Now we answer the actual PS question:
What hazards is this cell likely to produce in the next 0–6 hours?
1. One cell → multiple hazard models
CELL A17 STATE ↓ ┌──────────┼──────────┐ ↓ ↓ ↓ Lightning Hail Downburst │ │ │ └──────────┼──────────┘ ↓ Cloudburst
Each hazard should have its own prediction head/model, because the inputs and ground truth are different.
2. Lightning
Input:
radar evolution + lightning rate/density/trend + satellite evolution + environment
Output:
T+15 → lightning density T+30 → lightning density T+60 → lightning density ...
Example:
Cell A17 Lightning density T+15 = HIGH T+30 = VERY HIGH T+60 = HIGH
3. Hail
Use features such as:
radar intensity/structure + vertical storm information where available + thermodynamic/NWP features + cell evolution
Output:
P(hail) = 0.68
We should not claim this is accurate until tested against verified historical hail events.
IMD itself already produces Significant Hail Parameters through EWRF, so our novelty is not “we invented hail prediction.” ([internal.imd.gov.in](https://internal.imd.gov.in/press_release/20250114_pr_3552.pdf?utm_source=chatgpt.com))
4. Downburst
Potential evidence:
velocity structure + storm intensity + wind environment + precipitation structure
Output could be:
Predicted downburst velocity = XX m/s Confidence = ...
But this needs especially careful event labels because verified downburst observations are harder to obtain.
5. Cloudburst
Use:
radar rainfall/intensity + storm growth + rainfall accumulation + satellite + NWP
Then predict:
probability of exceeding the defined cloudburst criterion
The criterion must come from an authoritative definition/labeling methodology.
6. The important part: prediction is spatial
We don't just output:
Bhubaneswar = 74%
Instead:
2 km GRID ┌────┬────┬────┬────┐ │ .1 │ .2 │ .5 │ .7 │ ├────┼────┼────┼────┤ │ .2 │ .4 │ .8 │ .9 │ ├────┼────┼────┼────┤ │ .1 │ .3 │ .6 │ .8 │ └────┴────┴────┴────┘
Every cell can contain a hazard probability.
That is where the PS's 1–3 km spatial resolution becomes visible.
7. And now we combine hazard + trajectory
Suppose A17 is moving NE.
NOW ███ █████ ███ ● \ ● T+30 \ ● T+60
At each future position, its predicted hazard field is placed onto the grid.
So the system produces:
storm trajectory + future hazard footprint
rather than just a line.
8. Add uncertainty
Instead of:
Storm will be here.
we show:
Most likely path ↓ ████████████████ uncertainty corridor
And:
Hail probability = 68% Cloudburst probability = 74% Confidence = Medium
9. Milestone 5 success condition
For Cell A17:
CURRENT CELL ↓ fused state ↓ ┌─────────┼─────────┐ ↓ ↓ ↓ Lightning Hail Downburst └─────────┼─────────┘ ↓ Cloudburst ↓ 0–6 hr forecast ↓ 1–3 km fields
We should be able to click A17 and see:
CELL A17 Status: Intensifying Lightning: 84% Hail: 68% Downburst: ... Cloudburst: 74% Forecast: T+15 / T+30 / T+60 / ... / T+360

Milestone 6 — Hazard Footprint + ETA + Warning
Now we have:
M1: Detect cellM2: Track cellM3: Understand evolutionM4: Fuse sourcesM5: Predict hazards
Now we answer:
Where will the hazard affect, and when will it arrive?
1. Project the storm into the future
From Cell A17:
Current position + speed + direction + evolution + hazard prediction
we generate:
T+15 T+30 T+60 T+120 ... T+360 min
2. Create the future hazard footprint
Not just a line.
NOW █████ █████████ ● \ \ T+30 \ █████ \ ███████ \ \ T+60 \ ███████
The storm/hazard area can change size and shape as the cell evolves.
3. Put it onto the 1–3 km grid
┌────┬────┬────┬────┬────┐ │ 5 │ 12 │ 38 │ 72 │ 81 │ ├────┼────┼────┼────┼────┤ │ 3 │ 25 │ 61 │ 88 │ 76 │ ├────┼────┼────┼────┼────┤ │ 1 │ 15 │ 42 │ 67 │ 59 │ └────┴────┴────┴────┴────┘
Each cell represents predicted hazard probability.
We can have separate layers:
Lightning Hail Downburst Cloudburst
The PS specifically asks for a 1–3 km hazard representation and these hazard outputs.
4. Find affected locations
Now overlay:
Cities Villages Roads Hospitals Airports Railways Critical infrastructure
Example:
Storm footprint ↓ intersects Patia ↓ PATIA = affected
This is where the system becomes useful to authorities.
5. Calculate ETA
For every location in the predicted path:
Storm trajectory ↓ intersection with location ↓ predicted arrival-time window
Example:
PATIA ETA: 18:24–18:34 Bhubaneswar Airport ETA: 18:42–18:55 Cuttack ETA: 19:10–19:25
Don't show a falsely precise single time when uncertainty is significant.
6. Generate the warning
Now convert the technical prediction into an understandable alert.
Ministry / authority
CELL A17 Status: Intensifying Direction: NE Speed: 42 km/h Affected area: 14 grid cells Lightning: HIGH Hail: 68% Cloudburst: 74% Patia ETA: 18:24–18:34 Confidence: Medium
Public
⚠ THUNDERSTORM WARNING Patia High lightning risk Heavy rainfall possible Expected arrival: 18:24–18:34 Seek safe shelter.
The public shouldn't have to understand dBZ, tensors, or model outputs.
7. Update everything continuously
New radar/lightning/satellite data arrives:
NEW DATA ↓ Cell A17 state updated ↓ trajectory changes ↓ hazard footprint changes ↓ ETA changes ↓ warning updates
Example:
18:00 ETA = 32 min 18:10 new radar → storm faster ETA = 24 min 18:20 new observations → weakening ETA = 29 min confidence decreases
That is the real-time rolling nowcast.
8. Milestone 6 success condition
We should be able to take:
CELL A17
and produce:
Current position ↓ Future trajectory ↓ 1–3 km hazard footprint ↓ Affected locations ↓ ETA ↓ Warning

Milestone 7 — Confidence + Explainability
Now we have:
M1: DetectM2: TrackM3: Understand evolutionM4: Fuse sourcesM5: Predict hazardsM6: Determine affected area + ETA
Now answer:
“Why should I trust this warning?”
1. Every prediction gets confidence
Instead of:
Hail = 72%
show:
Hail probability: 72% Confidence: Medium
Confidence depends on things such as:
Freshness of data + agreement between sources + model uncertainty + tracking reliability
2. Show data freshness
For Cell A17:
RADAR 2 min old ✓ LIGHTNING 1 min old ✓ SATELLITE 8 min old ✓ NWP 32 min old ○
So the operator immediately knows how current the evidence is.
3. Show WHY the risk changed
Example:
WHY DID RISK INCREASE? ✓ Reflectivity increasing ✓ Lightning rate increasing ✓ Cell area expanding ✓ Satellite cloud evolution detected ✓ Storm trajectory approaching target
For example:
Lightning: 12 → 27 strikes/min Reflectivity: 44 → 53 dBZ
These are evidence/features, not fabricated explanations.
4. Confidence should change dynamically
At 18:00:
Hail: 61% Confidence: Medium
New radar + lightning arrives:
Hail: 74% Confidence: High
Later data contradict the trend:
Hail: 49% Confidence: Medium
So:
OBSERVE ↓ PREDICT ↓ NEW DATA ↓ UPDATE
5. If a source disappears
Radar ❌ Lightning ✓ Satellite ✓ NWP ✓
System continues, but:
Confidence: Low/Medium
rather than pretending the prediction is equally reliable.
6. UI
Click A17 → Explain Prediction
┌──────────────────────────────┐ │ CELL A17 │ ├──────────────────────────────┤ │ Hail probability: 74% │ │ Confidence: HIGH │ │ │ │ Main evidence │ │ ↑ Reflectivity │ │ ↑ Lightning activity │ │ ↑ Cell growth │ │ ↓ Cloud-top temperature │ │ + favourable environment │ │ │ │ Data freshness │ │ Radar 2 min │ │ Lightning 1 min │ │ Satellite 8 min │ │ NWP 32 min │ └──────────────────────────────┘
7. Milestone 7 success condition
For every warning we can answer:
What is predicted?
Why is it predicted?
How confident are we?
How fresh is the supporting data?
This makes the system much more credible for a ministry/disaster-management user.

Milestone 8 — Historical Replay + Scientific Verification
Now we prove:
“Our model works on storms it has never seen, without seeing the future.”
This is what makes the project scientifically credible.
1. Take a real past storm
Example:
Real event: 14:00 → 18:00
At simulated 15:00, the model receives only:
Radar ≤ 15:00 Lightning ≤ 15:00 Satellite ≤ 15:00 NWP ≤ 15:00
Everything after 15:00 is hidden.
2. Model makes its forecast
15:00 ↓ MODEL ↓ Forecast: 15:15 15:30 16:00 17:00 18:00
It predicts:
Cell location Trajectory Lightning Hail Cloudburst Downburst
3. Move the replay clock forward
At simulated 15:15:
ACTUAL 15:15 DATA ↓ compare with ↓ MODEL'S 15:15 PREDICTION
Then:
15:30 → compare 16:00 → compare 17:00 → compare ...
So the video literally shows:
PREDICTED ──────────► ACTUAL ─────────►
4. Measure different things separately
Storm tracking
Predicted position vs Actual position → track error in km
Lightning
Predicted probability/density vs Actual lightning
Hazard field
Predicted grid vs Observed grid
ETA
Predicted arrival vs Actual arrival
5. Compare against simple baselines
This is essential.
Persistence ↓ storm stays where it is Motion extrapolation ↓ storm continues at current speed Our multimodal model ↓ radar + lightning + satellite + NWP
Then show whether our model actually improves over simpler approaches.
6. Test on completely unseen storms
Don't randomly split individual radar frames.
Instead:
TRAIN Past storm events VALIDATION Different events TEST Completely unseen events
This answers your earlier concern:
“What if the next storm behaves differently?”
The test storms were never used to train the model.
7. Dashboard verification view
┌──────────────────────────────────┐ │ HISTORICAL REPLAY — EVENT #27 │ ├──────────────────────────────────┤ │ Forecast time: 15:00 │ │ │ │ PREDICTED │ │ ●───────→ │ │ │ │ ACTUAL │ │ ●──────→ │ │ │ │ Track error: 2.1 km │ │ ETA error: 4 min │ │ │ │ [Reveal next observation] │ └──────────────────────────────────┘
8. Final result of Milestone 8
We can make the claim:
“At prediction time, the model only received observations available at that moment. Future observations were withheld, then revealed chronologically for objective verification.”
This is much stronger than simply reporting an accuracy number.

Milestone 9 — Continuous Improvement
Now we close the loop.
M8 proved whether the prediction was right.M9 uses those errors to make the system better over time.
1. Forecast
Current storm state ↓ Model ↓ Prediction
Example:
Predicted ETA: 18:25 Predicted track: NE Hail probability: 70%
2. Reality arrives
Later we get:
Actual ETA: 18:31 Actual track: slightly east Hail: No
Now calculate errors:
ETA error = 6 min Track error = X km Hail prediction = false alarm
3. Find WHY the model failed
Store failure information:
Storm type Location Season Initial intensity Lightning behaviour Satellite behaviour NWP conditions Data freshness
Then discover patterns such as:
"Model performs poorly when storms rapidly split." "Model overpredicts hail in coastal environments." "Track error increases when cells merge."
These are examples; we would only claim them after analysis.
4. Retrain / recalibrate offline
We don't change the model randomly after every storm.
Instead:
New verified events ↓ error analysis ↓ new training data ↓ retrain / recalibrate ↓ new model version ↓ validate ↓ deploy
Example:
Model v1 ↓ 1000 verified events ↓ error analysis ↓ Model v2 ↓ re-test
5. Keep model versions
Model v1 Model v2 Model v3
For every version record:
training period test period metrics known weaknesses
So we can prove:
Did the new model actually improve?
The complete system is now a closed loop
OBSERVE ↓ DETECT ↓ TRACK ↓ UNDERSTAND ↓ FUSE ↓ PREDICT ↓ HAZARD + ETA ↓ WARNING ↓ REAL EVENT ↓ VERIFY ↓ ERROR ANALYSIS ↓ RETRAIN / CALIBRATE ↺

One important distinction remains: this is our proposed system architecture, while IMD already has many individual capabilities/components. We should present our contribution as the specific cell-centric, continuously updated, probabilistic, verification-driven layer rather than claiming all of these capabilities are new.
