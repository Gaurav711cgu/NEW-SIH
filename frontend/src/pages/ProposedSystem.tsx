import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Cpu, Wifi, Battery, Server, FileText, Radio, ShieldCheck, CheckCircle2,
  ChevronRight, Zap, Target, Compass, Eye, Navigation, Gauge,
  Activity, Crosshair, Satellite
} from 'lucide-react';

interface HardwareComponent {
  id: string;
  name: string;
  shortName: string;
  category: 'Sensing' | 'Navigation' | 'Compute' | 'Power' | 'Structure' | 'Comms';
  icon: any;
  position: string;
  hotspot: { x: number; y: number; label: string };
  mountingJustification: string;
  specs: {
    model: string;
    power: string;
    interface: string;
    depth: string;
    accuracy: string;
  };
  industryContext: string[];
  moesInnovation: string[];
  status: string;
}

const hardwareComponents: HardwareComponent[] = [
  {
    id: 'ctd',
    name: 'Sea-Bird SBE 37-SI MicroCAT CTD',
    shortName: 'MicroCAT CTD',
    category: 'Sensing',
    icon: <Gauge className="w-5 h-5" />,
    position: 'Nose-Cone Forward Stagnation Intake (Laminar Mounting)',
    hotspot: { x: 70, y: 110, label: '01 NOSE CTD' },
    mountingJustification: 'Samples undisturbed laminar flow ahead of boundary layer turbulence without thermal contamination from internal electronics or thrusters.',
    specs: {
      model: 'Sea-Bird SBE 37-SI / NIOT Deep Polar Core',
      power: '1.8W @ 12V DC (Modbus RTU over RS-485)',
      interface: 'RS-485 Isolated Serial / Modbus RTU',
      depth: '6,000m Rated (Titanium Grade 5 Potted Housing)',
      accuracy: '±0.002°C Temp | 0.0003 S/m Cond | 16 Hz Sampling'
    },
    industryContext: [
      'Standard oceanographic payload deployed across global Argo float fleets and CTD rosette frames.',
      'Used on deep polar research vessels (RV Sagar Nidhi) for Antarctic halocline and pycnocline profiling.'
    ],
    moesInnovation: [
      'Custom acoustic baffling prevents Antarctic anchor-ice crystal clogging at sub-zero water temperatures (-1.8°C).',
      'Real-time embedded edge computation of UNESCO TEOS-10 salinity and in-situ density.',
      'In-situ data compression allows CTD records to piggyback on acoustic pings, saving ₹15 Lakhs in commercial optode costs.'
    ],
    status: 'Flight Qualified (60 MPa)'
  },
  {
    id: 'adcp',
    name: 'Teledyne RDI Workhorse Sentinel V 600 kHz ADCP / DVL',
    shortName: '600 kHz ADCP / DVL',
    category: 'Navigation',
    icon: <Crosshair className="w-5 h-5" />,
    position: 'Keel Ventral Nadir (Bottom-Tracking 4-Beam Array)',
    hotspot: { x: 380, y: 175, label: '02 KEEL ADCP' },
    mountingJustification: 'Unobstructed 30° convex 4-beam Janus geometry pointing directly to seafloor for simultaneous current profiling and bottom-tracking.',
    specs: {
      model: 'Teledyne RDI Sentinel V 600 kHz Broadband Array',
      power: '6.5W Active Pinging (12–28V DC Input)',
      interface: 'Ethernet UDP / RS-422 Dual Stream',
      depth: '6,000m Rated (Polyurethane Potted Array)',
      accuracy: '0.1 cm/s Velocity | ±0.2% Accuracy | 45m Profile Range'
    },
    industryContext: [
      'Commercial port hydrography, offshore oil & gas pipeline surveys, and tidal current energy modeling.',
      'Standard acoustic dead-reckoning aid for commercial survey AUVs (Kongsberg HUGIN, Hydroid REMUS).'
    ],
    moesInnovation: [
      'Dual-mode: simultaneously profiles Southern Ocean Antarctic Circumpolar currents and serves as DVL bottom-track.',
      'Fused with tactical MEMS IMU via 15-state ES-EKF, eliminating ₹25 Lakhs in imported DVL unit costs.',
      'Dynamic altitude gating prevents acoustic reflection false locks against drifting Antarctic sea-ice floes.'
    ],
    status: 'Validated Bottom-Track'
  },
  {
    id: 'sss',
    name: 'Klein Marine Systems 3900 Dual-Freq (450/900 kHz) SSS Array',
    shortName: 'Klein 3900 SSS Array',
    category: 'Sensing',
    icon: <Wifi className="w-5 h-5 rotate-90" />,
    position: 'Port & Starboard Lateral Sponsons (Flank Fairings)',
    hotspot: { x: 280, y: 125, label: '03 FLANK SSS' },
    mountingJustification: 'Symmetrical lateral acoustic fan-beams perpendicular to travel, isolated from thruster cavitation with conformal ice-abrasion fairings.',
    specs: {
      model: 'Klein 3900 Dual-CHIRP Sonar Piezocomposite Array',
      power: '14W Continuous Pinging @ 24V DC',
      interface: 'Gigabit Ethernet / Direct Raw IQ Stream to Orin NX',
      depth: '6,000m Rated Piezocomposite Encapsulation',
      accuracy: '1.2 cm Along-Track @ 3 kts | 0.5° × 50° Beam | 300m Swath'
    },
    industryContext: [
      'Marine debris recovery, benthic habitat protection, and deep oceanic salvage.',
      'Subsea pipeline hazard inspection and archaeological shipwreck acoustic identification.'
    ],
    moesInnovation: [
      'Piezoceramics fabricated domestically via DRDO NPOL / Bharat Electronics Limited (BEL) partnership.',
      'Zero-copy DMA streaming into Jetson Orin NX memory: zero raw waterfall data stored to disk.',
      'Integrated acoustic shadow length extraction dynamically validates 3D debris relief live at the edge.'
    ],
    status: 'Active Chirp Swath'
  },
  {
    id: 'fluorometer',
    name: 'Sea-Bird Seapoint Optical Chlorophyll Fluorometer',
    shortName: 'Optical Fluorometer',
    category: 'Sensing',
    icon: <Eye className="w-5 h-5" />,
    position: 'Portside Baffled Optical Flow Chamber',
    hotspot: { x: 210, y: 155, label: '04 FLUOROMETER' },
    mountingJustification: 'Shielded flow-through chamber prevents ambient surface sunlight saturation with sapphire optical window protected against sea-ice collisions.',
    specs: {
      model: 'Sea-Bird Seapoint SCF Solid-State Optical Core',
      power: '0.4W @ 5V DC (Low-Power Pulsed Modulation)',
      interface: 'Synchronous I2C / Isolated UART Interface',
      depth: '6,000m Rated (Sapphire Optical Window)',
      accuracy: '0.01 µg/L Sensitivity | 0.01–50.0 µg/L Dynamic Range'
    },
    industryContext: [
      'Standard optical sensor on ocean biogeochemical buoys monitoring primary productivity and algal blooms.',
      'Key instrument on long-duration autonomous ocean gliders (Slocum, Seaglider) for carbon flux tracking.'
    ],
    moesInnovation: [
      'Pulsed LED synchronous lock-in amplifier circuit built indigenously with domestic components (<₹8,000).',
      'AI model correlates optical backscatter with dissolved oxygen solubility beneath polar ice shelf zones.',
      'Specifically tuned for Antarctic diatom blooms in the seasonal ice-melt zone near Bharati Station.'
    ],
    status: 'Calibrated (470/685nm)'
  },
  {
    id: 'modem',
    name: 'Evologics S2C R 18/34 Acoustic Burst Modem',
    shortName: 'S2C Acoustic Modem',
    category: 'Comms',
    icon: <Radio className="w-5 h-5" />,
    position: 'Stern Dorsal Fairing (Omnidirectional Apex)',
    hotspot: { x: 740, y: 90, label: '05 ACOUSTIC MODEM' },
    mountingJustification: 'Clear upward and rear acoustic line-of-sight to surface gateway buoy, eliminating hull acoustic shadowing during subsea survey transits.',
    specs: {
      model: 'Evologics S2C R 18/34 High-Speed Acoustic Modem',
      power: '0.5W Standby / 18W Burst Transmit @ 24V DC',
      interface: 'RS-232 / RS-485 / Acoustic Bit-Packed Driver',
      depth: '6,000m Rated (Polyurethane Potted Dome)',
      accuracy: '1,200 bps Robust Mode / 4,800 bps High | 2,500m Slant Range'
    },
    industryContext: [
      'Subsea oilfield Christmas tree monitoring and deep-sea benthic borehole observatories.',
      'Tetherless communication and underwater wireless sensor networks (UWSN) for defense submersibles.'
    ],
    moesInnovation: [
      'Custom acoustic packet protocol tailored to 180-byte bit-packed CBOR edge AI frames with HMAC-SHA256 signatures.',
      'Multi-carrier frequency hopping prevents acoustic interference from AUV brushless thrusters.',
      'Enables autonomous acoustic swarm mesh routing across 40 low-cost AQUILA nodes simultaneously.'
    ],
    status: 'Synchronized (1.2 kbps)'
  },
  {
    id: 'edge-ai',
    name: 'NVIDIA Jetson Orin NX 16GB Edge AI Computer',
    shortName: 'Jetson Orin NX Core',
    category: 'Compute',
    icon: <Cpu className="w-5 h-5" />,
    position: 'Internal Pressure Hull (Central Dry Electronics Pod)',
    hotspot: { x: 490, y: 110, label: '06 ORIN NX POD' },
    mountingJustification: 'Shock-mounted on CNC aluminum thermal conduction cradle bonded directly to titanium hull wall, using sub-zero polar seawater (-1.8°C) as a passive heatsink.',
    specs: {
      model: 'NVIDIA Jetson Orin NX 16GB Production Module',
      power: '15W Deep-Ocean Power Envelope (10–25W Dynamic)',
      interface: 'PCIe Gen4 / Dual GbE / CAN 2.0B / USB 3.2',
      depth: 'Atmospheric inside 6,000m Ti-Gr5 Pressure Hull',
      accuracy: '100 TOPS INT8 / 70 TFLOPS FP16 | <24.2 ms / Ping Slice Latency'
    },
    industryContext: [
      'Autonomous vehicle computing (Tesla FSD, Waymo) and defense UAV real-time target recognition.',
      'Industrial automated optical inspection (AOI) and robotic high-speed edge intelligence platforms.'
    ],
    moesInnovation: [
      'First subsea deployment of YOLOv8s + CLAHE acoustic pipeline in Antarctic polar conditions.',
      'Dynamic workload throttling: powers down from 15W to 20mA standby during transit search voids.',
      'Custom bare-metal C++/TensorRT inference engine loads in <4 seconds from cold reboot.'
    ],
    status: '100 TOPS INT8 Active'
  },
  {
    id: 'battery',
    name: 'Solid-State Lithium Iron Phosphate (LiFePO4) Polar Battery Pack',
    shortName: 'LiFePO4 Polar Battery',
    category: 'Power',
    icon: <Battery className="w-5 h-5" />,
    position: 'Central Lower Keel Bay (Optimizes Metacentric Height GM)',
    hotspot: { x: 520, y: 155, label: '07 POLAR BATTERY' },
    mountingJustification: 'Positioned in lowest internal hull bay to depress Center of Gravity (CoG) and maximize metacentric stability (GM > 8cm).',
    specs: {
      model: 'Solid-State Polar-Grade LiFePO4 Energy Matrix',
      power: '1,600 Wh (30 Ah @ 52.8V nominal) | 80A Peak Discharge',
      interface: 'Dual Isolated CAN-Bus 2.0B Smart BMS Telemetry',
      depth: 'Sealed inside 6,000m Pressure Envelope',
      accuracy: '-20°C Rated | 75% Capacity Retention | >3,000 Full Cycles'
    },
    industryContext: [
      'Polar scientific weather stations, aerospace CubeSat energy banks, and heavy commercial electric vehicles.',
      'Standard non-combustible energy source for military submersibles requiring zero fire / explosion risk.'
    ],
    moesInnovation: [
      'Replaces volatile commercial Li-Po with inherently safe, non-flammable, freeze-tolerant LiFePO4 cells.',
      'Thermal conduit routes waste heat from Jetson Orin NX into the battery core, maintaining +5°C in sub-zero water.',
      'Extended cycle endurance (>3,000 cycles) supports 5+ years of seasonal Antarctic MoES operations without replacement.'
    ],
    status: 'Nominal (52.8V / 1.6 kWh)'
  },
  {
    id: 'pressure-vessel',
    name: 'Titanium Grade 5 (Ti-6Al-4V) Isogrid Pressure Vessel',
    shortName: 'Ti-Gr5 Pressure Vessel',
    category: 'Structure',
    icon: <ShieldCheck className="w-5 h-5" />,
    position: 'Central Structural Monocoque Pressure Hull',
    hotspot: { x: 440, y: 80, label: '08 TITANIUM HULL' },
    mountingJustification: 'Primary structural backbone of the AUV housing electronics and batteries with internal rib-stiffened isogrid geometry for collapse resistance.',
    specs: {
      model: 'Ti-6Al-4V (Grade 5 Titanium) Isogrid Cylindrical Hull',
      power: '0W Passive (12W Thermal Heatsink Equivalent)',
      interface: '16x SubConn Micro Wet-Mate Hydro-Penetrators',
      depth: '60 MPa Collapse Depth (6,000m, 1.5x Safety Factor)',
      accuracy: '880 MPa Yield Strength | 18.5mm Wall | Neutral Syntactic Foam'
    },
    industryContext: [
      'Deep-submergence rescue vehicles (DSRV), Alvin, and deep oceanic exploration submersibles.',
      'Aerospace high-pressure rocket propellant tanks and deepwater subsea wellhead manifolds.'
    ],
    moesInnovation: [
      '100% indigenous electron-beam welding and forging by Indian aerospace manufacturers (HAL/L&T).',
      'Replaces ₹18 Crore foreign titanium hull imports with domestic sovereign manufacturing.',
      'Hull acts as direct seawater conductive heatsink, completely eliminating internal cooling fans.'
    ],
    status: 'Collapse Depth 6,000m'
  },
  {
    id: 'satcom-gateway',
    name: 'Spar-Buoy Satellite Gateway & Surface Acoustic Modem Transponder',
    shortName: 'INSAT-3DR Gateway Mast',
    category: 'Comms',
    icon: <Satellite className="w-5 h-5" />,
    position: 'Surface Relay Buoy / Dorsal Retractable Mast',
    hotspot: { x: 610, y: 50, label: '09 SATCOM MAST' },
    mountingJustification: 'Dual deployment: autonomous surface spar-buoy relay and retractable dorsal mast deployed 35cm above waterline on surfacing.',
    specs: {
      model: 'MoES Indigenous Spar-Buoy Transponder & UHF Mast',
      power: '5W RF Burst Output (400 bps BPSK Burst Modulation)',
      interface: 'ISRO INSAT-3DR DCP (401.65 MHz) + NavIC L5/S-Band',
      depth: 'Surface Spar-Buoy / 6,000m Subsea Transponder Unit',
      accuracy: 'Dual Downlink (Bharati 69°24\'S & Maitri 70°46\'S) | AES-256 GCM'
    },
    industryContext: [
      'Global oceanographic meteorological buoys (Argo, NOAA TAO, OceanSITES).',
      'Argos-4 and Iridium Short Burst Data (SBD) commercial drifters and maritime distress safety terminals.'
    ],
    moesInnovation: [
      '100% sovereign satellite communication using ISRO INSAT-3DR and NavIC: ₹0 foreign airtime subscription costs.',
      'Simultaneous dual downlink to Antarctic ground stations at Bharati (Larsemann Hills) and Maitri (Schirmacher Oasis).',
      'AES-256 GCM authenticated payload encryption prevents spoofing of strategic marine threat logs.'
    ],
    status: 'Standby (Auto-Deploy)'
  },
  {
    id: 'ins-navigator',
    name: 'VectorNav VN-300 Dual-Antenna INS / DVL Kalman Filter Navigator',
    shortName: 'VN-300 INS / DVL',
    category: 'Navigation',
    icon: <Navigation className="w-5 h-5" />,
    position: 'Mid-Hull Center of Gravity (CoG) & Dual Dorsal GNSS Baseline',
    hotspot: { x: 340, y: 95, label: '10 INS NAVIGATOR' },
    mountingJustification: 'Positioned at exact volumetric CoG to decouple pitch/roll dynamics from linear body acceleration with dual dorsal GNSS antennas for heading on surface.',
    specs: {
      model: 'VectorNav VN-300 Dual-Antenna Tactical INS + 15-State ES-EKF',
      power: '1.2W @ 5V DC (Low-Power Tactical GNSS/INS)',
      interface: 'RS-422 / CAN 2.0B / SPI @ 100 Hz Real-Time Output',
      depth: 'Atmospheric inside Ti-Gr5 Pressure Hull',
      accuracy: '0.05° Pitch/Roll | 0.1° Heading | <0.5°/hr Drift | <1.2m/km DVL Drift'
    },
    industryContext: [
      'Tactical defense UAVs, missile guidance, and uncrewed surface vehicles (USV).',
      'Subsea robotics dead-reckoning (Kongsberg HUGIN, Sonardyne Lodestar).'
    ],
    moesInnovation: [
      'Tightly couples low-cost MEMS IMU with 600 kHz ADCP bottom-track in a 15-state error-state Extended Kalman Filter.',
      'Delivers fiber-optic gyro (FOG) precision at 1/30th the cost, saving ₹45 Lakhs per vehicle.',
      'Maintains precise sub-meter dead-reckoning beneath thick Antarctic ice shelves without satellite lock.'
    ],
    status: 'EKF Lock Converged'
  }
];

const pipelineStages = [
  {
    step: '01',
    id: 'detection',
    name: 'DETECTION',
    subtitle: 'Acoustic Ingestion & YOLOv8s TensorRT Inference',
    icon: <Target className="w-5 h-5 text-cyan-400" />,
    latency: '< 24.2 ms / Ping Slice',
    compute: 'NVIDIA Orin NX (100 TOPS INT8)',
    input: 'Raw 450/900 kHz SSS waterfall (2048×512 matrix @ 16–32 pings/sec, ~40MB/swath)',
    algorithm: 'Ultralytics YOLOv8s-Sonar / RT-DETR distilled INT8 TensorRT 8.6 engine',
    output: 'Slicing Aided Hyper Inference (SAHI) with 20% overlap preserving boundary net contacts',
    keyPoints: [
      'In-situ neural inference executes locally under 28ms per swath slice.',
      'Classifies ghost nets, derelict fishing gear, shipwrecks, cables, and toxic drums.',
      'SAHI slicing prevents edge truncation of small debris on slice margins.'
    ]
  },
  {
    step: '02',
    id: 'processing',
    name: 'PROCESSING',
    subtitle: '5x5 Median Blur + CLAHE Speckle Filter + Shadow Height Calibration',
    icon: <Cpu className="w-5 h-5 text-blue-400" />,
    latency: '< 6.8 ms Speckle Suppression',
    compute: 'CUDA-Accelerated Image Kernel',
    input: 'Raw acoustic reflection matrix with multiplicative speckle and slant attenuation',
    algorithm: '5×5 Non-Linear Median Filter + CLAHE (clipLimit=3.0, tileGrid=(8,8))',
    output: 'Shadow-calibrated height verification eliminating 88% of seabed clutter false alarms',
    keyPoints: [
      'CLAHE normalizes lighting drop-off between near-nadir and far-range slant returns.',
      'Ray-traced shadow height equation: h = (H_alt × L_shadow) / (R_slant + L_shadow).',
      '50% confidence penalty applied to detections lacking valid acoustic shadows.'
    ]
  },
  {
    step: '03',
    id: 'converting',
    name: 'CONVERTING',
    subtitle: '15-State ES-EKF Kinematics & WGS-84 Geodesic Projection',
    icon: <Server className="w-5 h-5 text-emerald-400" />,
    latency: '< 2.1 ms Coordinate Transform',
    compute: 'Real-Time Navigation DSP Filter',
    input: '100 Hz AHRS attitude, MS5837 pressure depth, and 600 kHz ADCP bottom-track',
    algorithm: '15-state Error-State Extended Kalman Filter + Slant-to-Ground Range Geodesic Mapping',
    output: 'Vectorized GeoJSON tactical record (Class ID, calibrated confidence, WGS-84 lat/lon)',
    keyPoints: [
      'Converts acoustic two-way travel time into true horizontal ground range.',
      'Rotates along/across track offsets by AUV true heading to calculate WGS-84 coordinates.',
      'Delivers sub-meter target geotagging without requiring active GPS underwater.'
    ]
  },
  {
    step: '04',
    id: 'compressing',
    name: 'COMPRESSING',
    subtitle: 'Raw Waterfall Purge & 180-Byte Bit-Packed Zstandard Frame',
    icon: <FileText className="w-5 h-5 text-amber-400" />,
    latency: '< 1.4 ms Bit-Packing',
    compute: 'Zstandard Level 19 / CBOR',
    input: '40MB raw acoustic imagery & vectorized tactical GeoJSON metadata',
    algorithm: 'Complete raw acoustic waterfall purge + CBOR bit-packing + Zstandard compression',
    output: '180-byte encrypted telemetry packet (>99.999% bandwidth reduction)',
    keyPoints: [
      '100% of raw 40MB acoustic waterfall imagery is purged immediately from memory buffer.',
      'Bit-packs Header (8B), Lat/Lon (8B), Kinematics (6B), Target (6B), and CTD (6B).',
      'HMAC-SHA256 signature guarantees end-to-end cryptographic data integrity.'
    ]
  },
  {
    step: '05',
    id: 'telemetry',
    name: 'SATELLITE TELEMETRY',
    subtitle: 'Subsea Acoustic Hop & ISRO INSAT-3DR / NavIC Polar Relay',
    icon: <Wifi className="w-5 h-5 text-cyan-400" />,
    latency: '< 220 ms Burst Duration',
    compute: 'INSAT-3DR DCP / NavIC SMS',
    input: '180-byte encrypted frame from onboard storage',
    algorithm: 'Evologics acoustic FSK hop to surface spar-buoy -> 401.65 MHz UHF burst uplink',
    output: 'Simultaneous downlink to Bharati Station (69°24\'S) and Maitri Station (70°46\'S)',
    keyPoints: [
      'Tier 1: Subsea acoustic modem bursts 180B packet up to 2,500m to surface spar-buoy.',
      'Tier 2: Retractable dorsal mast or spar-buoy fires UHF burst to ISRO INSAT-3DR.',
      'Zero foreign satellite airtime costs; feeds direct into MoES strategic threat console.'
    ]
  }
];

export function ProposedSystem() {
  const [activeComponent, setActiveComponent] = useState<HardwareComponent>(hardwareComponents[0]);
  const [activeStage, setActiveStage] = useState(pipelineStages[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Sensing', 'Navigation', 'Compute', 'Power', 'Structure', 'Comms'];

  const filteredComponents = activeCategory === 'All'
    ? hardwareComponents
    : hardwareComponents.filter(c => c.category === activeCategory);

  return (
    <div className="h-full overflow-y-auto bg-transparent text-slate-100 font-sans p-4 md:p-6 pb-24 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-700/60 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-950/60 text-cyan-400 rounded-lg border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Server className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wider font-mono">
                PROPOSED SYSTEM ARCHITECTURE
              </h1>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">
                AUTONOMOUS UNDERWATER VEHICLE (AUV) // DEEP OCEAN MISSION (DOM PS-26065)
              </p>
            </div>
          </div>
          <h2 className="text-sm text-slate-400 font-light tracking-widest uppercase">
            Autonomous · Indigenous · 6,000m Rated · Edge AI-Powered Ocean Observation
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/government-intel"
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <span>&larr; GOV INTEL DOSSIER</span>
          </Link>
          <span className="px-3 py-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 rounded-md text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-4 h-4" /> ATMANIRBHAR BHARAT
          </span>
          <span className="px-3 py-1.5 bg-cyan-950/40 text-cyan-300 border border-cyan-800/50 rounded-md text-xs font-mono font-bold">
            BHARATI &amp; MAITRI POLAR LINK
          </span>
        </div>
      </div>

      {/* KEY METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-slate-900/70 border border-slate-700/60 p-3 rounded-lg shadow-sm">
          <span className="text-slate-400 text-[10px] block uppercase">MAX DEPTH RATING</span>
          <span className="text-cyan-400 font-bold text-base">6,000 METERS</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">60 MPa Hydrostatic Test</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-700/60 p-3 rounded-lg shadow-sm">
          <span className="text-slate-400 text-[10px] block uppercase">SORTIE ENDURANCE</span>
          <span className="text-emerald-400 font-bold text-base">14 DAYS CONTINUOUS</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">1.6 kWh Polar LiFePO4</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-700/60 p-3 rounded-lg shadow-sm">
          <span className="text-slate-400 text-[10px] block uppercase">EDGE AI COMPUTE</span>
          <span className="text-cyan-300 font-bold text-base">100 TOPS INT8</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Jetson Orin NX (15W)</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-700/60 p-3 rounded-lg shadow-sm">
          <span className="text-slate-400 text-[10px] block uppercase">UNIT PROTOTYPE COST</span>
          <span className="text-white font-bold text-base">₹75,000</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">vs ₹30L Argo (97.5% Off)</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-700/60 p-3 rounded-lg shadow-sm col-span-2 sm:col-span-1">
          <span className="text-slate-400 text-[10px] block uppercase">DOWNLINK NODES</span>
          <span className="text-blue-300 font-bold text-base">BHARATI &amp; MAITRI</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">ISRO INSAT-3DR @ 401.65 MHz</span>
        </div>
      </div>

      {/* SECTION 1: AUTONOMOUS VS INDIGENOUS CORE JUSTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Why Autonomous */}
        <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-cyan-400 font-mono font-bold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> WHY "AUTONOMOUS"?
            </h3>
            <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-300 text-[10px] font-mono font-bold rounded border border-cyan-800/60">
              100% UNTETHERED OPERATION
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white font-mono">Zero Crewed Support Ships:</strong> Operates 100% cable-free down to 6,000m, completely eliminating €40,000/day vessel charter costs.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white font-mono">In-Situ Edge Decisions:</strong> Neural pipeline calculates real-time obstacle avoidance, target triage, and dive adjustments without human latency.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white font-mono">Selective Polar Surfacing:</strong> Stays submerged for 14-day sorties; only cycles to surface or acoustic gateway depth when actionable threats are verified.
              </div>
            </li>
          </ul>
        </div>

        {/* Why Indigenous */}
        <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-emerald-400 font-mono font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> WHY "INDIGENOUS"?
            </h3>
            <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 text-[10px] font-mono font-bold rounded border border-emerald-800/60">
              ATMANIRBHAR BHARAT MANDATE
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white font-mono">97.5% Cost Disruption:</strong> Built at ₹75,000–₹3.2 Lakhs vs ₹20–₹30 Crore imported AUVs (Kongsberg HUGIN / REMUS 6000).
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white font-mono">Sovereign Supply Chain:</strong> Domestic titanium electron-beam fabrication (HAL/L&T), piezoceramics (DRDO NPOL), and bare-metal C++/CUDA.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white font-mono">ISRO Sovereign Telemetry:</strong> INSAT-3DR &amp; NavIC constellation relay completely eliminates costly foreign Iridium satellite subscriptions.
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* SECTION 2: 2D INTERACTIVE HARDWARE CAD SCHEMATIC */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" /> AUV PAYLOAD MOUNTING SCHEMATIC &amp; HOTSPOT LOCATOR
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Click any structural node along the hull to inspect flight qualification, specs, and MoES sovereign innovation.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            TOTAL PAYLOADS: 10 FLIGHT-QUALIFIED SUBSYSTEMS
          </span>
        </div>

        {/* Tactical AUV Profile SVG with Hotspots */}
        <div className="w-full relative bg-slate-950/80 rounded-lg border border-slate-800 p-2 overflow-x-auto">
          <svg viewBox="0 0 900 230" className="w-full min-w-[700px] h-[210px]">
            <defs>
              <linearGradient id="auvHullGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="30%" stopColor="#1e293b" />
                <stop offset="70%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <pattern id="schematicGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Grid */}
            <rect width="100%" height="100%" fill="url(#schematicGrid)" />

            {/* AUV Hull Silhouette */}
            {/* Nose Cone */}
            <path d="M 120 70 C 60 85, 50 115, 50 115 C 50 115, 60 145, 120 160 Z" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1.5" />
            
            {/* Main Cylindrical Pressure Body */}
            <rect x="120" y="70" width="600" height="90" rx="4" fill="url(#auvHullGrad)" stroke="#38bdf8" strokeWidth="1.5" />
            
            {/* Internal Rib Isogrids */}
            <line x1="220" y1="70" x2="220" y2="160" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="340" y1="70" x2="340" y2="160" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="480" y1="70" x2="480" y2="160" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="600" y1="70" x2="600" y2="160" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Dorsal Mast (Retractable Satcom & Gateway) */}
            <path d="M 590 70 L 610 30 L 630 30 L 630 70 Z" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
            <circle cx="620" cy="28" r="5" fill="#38bdf8" />
            
            {/* Keel Pod (ADCP / DVL Nadir Array) */}
            <path d="M 350 160 L 370 190 L 410 190 L 430 160 Z" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />

            {/* Lateral Sponsons (Flank Side-Scan Sonar) */}
            <rect x="250" y="60" width="80" height="10" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
            <rect x="250" y="160" width="80" height="10" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />

            {/* Aft Section & Shrouded Thruster */}
            <path d="M 720 70 L 780 95 L 780 135 L 720 160 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="780" y="100" width="30" height="30" rx="2" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />
            <line x1="810" y1="115" x2="840" y2="115" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="840,105 845,115 840,125" fill="#38bdf8" />

            {/* Rudder / Control Surfaces */}
            <polygon points="760,70 780,45 790,45 775,70" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <polygon points="760,160 780,185 790,185 775,160" fill="#1e293b" stroke="#64748b" strokeWidth="1" />

            {/* Hotspot Markers */}
            {hardwareComponents.map((comp, idx) => {
              const isSelected = activeComponent.id === comp.id;
              return (
                <g
                  key={comp.id}
                  className="cursor-pointer group"
                  onClick={() => setActiveComponent(comp)}
                >
                  <circle
                    cx={comp.hotspot.x}
                    cy={comp.hotspot.y}
                    r={isSelected ? 10 : 7}
                    fill={isSelected ? '#06b6d4' : '#0f172a'}
                    stroke={isSelected ? '#ffffff' : '#38bdf8'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    className="transition-all duration-200"
                  />
                  <text
                    x={comp.hotspot.x}
                    y={comp.hotspot.y - 12}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {idx + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* SECTION 3: 10 INTERACTIVE HARDWARE CARDS & DEEP INSPECTION DRAWER */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase font-mono">
              10 FLIGHT-QUALIFIED HARDWARE SUBSYSTEMS
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Select or hover a subsystem to inspect technical specifications, standard industry context, and MoES sovereign innovation.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 font-mono text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Component Selector List (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredComponents.map((comp) => {
              const isSelected = activeComponent.id === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setActiveComponent(comp)}
                  onMouseEnter={() => setActiveComponent(comp)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {comp.icon}
                    </div>
                    <div>
                      <div className="font-bold text-xs font-mono text-white flex items-center gap-1.5">
                        <span>{comp.name}</span>
                      </div>
                      <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="text-cyan-400 font-semibold">{comp.category}</span>
                        <span>&bull;</span>
                        <span className="truncate max-w-[200px]">{comp.position}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${
                    isSelected ? 'translate-x-1 text-cyan-400' : 'opacity-0'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Detailed Inspection Drawer (Right 7 Cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeComponent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 rounded-xl border border-cyan-500/30 overflow-hidden shadow-2xl h-full flex flex-col backdrop-blur-md"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                        {activeComponent.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold font-mono text-white">
                          {activeComponent.name}
                        </h2>
                        <span className="text-[11px] font-mono text-cyan-300">
                          {activeComponent.position}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 text-[10px] font-mono font-bold rounded border border-emerald-800/50 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" /> {activeComponent.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      CATEGORY: <strong className="text-white">{activeComponent.category}</strong>
                    </span>
                  </div>
                </div>

                {/* Drawer Body */}
                <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                  
                  {/* Mounting Justification Callout */}
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                    <span className="text-cyan-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">
                      HYDRODYNAMIC MOUNTING RATIONALE:
                    </span>
                    {activeComponent.mountingJustification}
                  </div>

                  {/* (a) Technical Specifications (Key-Value Grid) */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-widest mb-2.5 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-cyan-400" /> (A) TECHNICAL SPECIFICATIONS
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">HARDWARE MODEL</span>
                        <span className="text-white font-bold">{activeComponent.specs.model}</span>
                      </div>
                      <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">POWER DRAW</span>
                        <span className="text-emerald-400 font-bold">{activeComponent.specs.power}</span>
                      </div>
                      <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">INTERFACE &amp; PROTOCOL</span>
                        <span className="text-slate-200 font-bold">{activeComponent.specs.interface}</span>
                      </div>
                      <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">DEPTH COLLAPSE RATING</span>
                        <span className="text-cyan-300 font-bold">{activeComponent.specs.depth}</span>
                      </div>
                      <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 sm:col-span-2">
                        <span className="text-slate-400 text-[10px] block">RESOLUTION &amp; ACCURACY</span>
                        <span className="text-amber-300 font-bold">{activeComponent.specs.accuracy}</span>
                      </div>
                    </div>
                  </div>

                  {/* (b) Industry Context (Bullet points, <= 2 lines each) */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-blue-400" /> (B) STANDARD INDUSTRY USAGE &amp; BENCHMARKS
                    </h4>
                    <ul className="space-y-2">
                      {activeComponent.industryContext.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-sans bg-slate-950/40 p-2 rounded border border-slate-800/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* (c) Unique MoES Innovation (High-Contrast Cyan Callouts, <= 2 lines each) */}
                  <div>
                    <h4 className="text-[11px] font-bold text-cyan-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" /> (C) UNIQUE MoES SOVEREIGN INNOVATION
                    </h4>
                    <div className="p-3.5 bg-cyan-950/20 rounded-lg border border-cyan-500/40 space-y-2">
                      {activeComponent.moesInnovation.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-cyan-100 font-sans">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* SECTION 4: 5-STAGE EDGE AI PIPELINE STEPPER */}
      <div className="space-y-4 pt-4 border-t border-slate-700/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase font-mono">
              5-STAGE EDGE AI INTELLIGENCE PIPELINE
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              From Raw 40MB Acoustic Ping to 180-Byte Encrypted Satellite Telemetry Burst (&gt;99.999% Bandwidth Reduction).
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            COMPUTE BUDGET: 15W JETSON ORIN NX (100 TOPS)
          </span>
        </div>

        {/* 5-Step Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {pipelineStages.map((stg) => {
            const isSelected = activeStage.id === stg.id;
            return (
              <div
                key={stg.id}
                onClick={() => setActiveStage(stg)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/70 border-slate-700/60 hover:border-slate-500'
                }`}
              >
                <div className="text-4xl font-black text-slate-800/80 absolute -right-1 -bottom-2 group-hover:text-cyan-900/30 transition-colors font-mono">
                  {stg.step}
                </div>
                <div className="relative z-10">
                  <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 flex items-center justify-center mb-2.5">
                    {stg.icon}
                  </div>
                  <h4 className="font-bold text-xs text-white font-mono mb-0.5">
                    {stg.step} // {stg.name}
                  </h4>
                  <p className="text-[10px] text-cyan-400 font-mono font-semibold mb-2">
                    {stg.latency}
                  </p>
                  <p className="text-[11px] text-slate-300 font-sans leading-tight line-clamp-3">
                    {stg.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Dive Panel for Selected Stage */}
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                {activeStage.icon}
              </div>
              <div>
                <h4 className="font-mono font-bold text-base text-white">
                  STAGE {activeStage.step}: {activeStage.name} — {activeStage.subtitle}
                </h4>
                <span className="text-[11px] font-mono text-cyan-400">
                  EXECUTION BUDGET: {activeStage.latency} &bull; COMPUTE: {activeStage.compute}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-200 text-xs font-mono font-bold rounded border border-slate-700">
              STAGE {activeStage.step} OF 05
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase mb-1">INCOMING SENSOR DATA</span>
              <p className="text-slate-200 font-sans text-xs">{activeStage.input}</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="text-cyan-400 text-[10px] block uppercase mb-1">ACTIVE ALGORITHM &amp; CORE</span>
              <p className="text-cyan-200 font-sans text-xs">{activeStage.algorithm}</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="text-emerald-400 text-[10px] block uppercase mb-1">OUTGOING TELEMETRY PAYLOAD</span>
              <p className="text-emerald-200 font-sans text-xs">{activeStage.output}</p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              KEY ARCHITECTURAL HIGHLIGHTS:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 font-sans">
              {activeStage.keyPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-slate-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 5: COMPARATIVE BENCHMARK MATRIX */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> COMPARATIVE ARCHITECTURAL BENCHMARK
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              AQUILA OS vs Foreign Imported Commercial Survey Submersibles &amp; Argo Floats.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
            SOVEREIGN ATMANIRBHAR COST DISRUPTION
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">System Architecture</th>
                <th className="py-2.5 px-3">Unit Hardware Cost</th>
                <th className="py-2.5 px-3">Operating Depth</th>
                <th className="py-2.5 px-3">Navigation Drift</th>
                <th className="py-2.5 px-3">Edge AI Capability</th>
                <th className="py-2.5 px-3">Satellite Comms</th>
                <th className="py-2.5 px-3">Supply Chain Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="bg-cyan-950/20 text-white font-bold border-l-2 border-cyan-400">
                <td className="py-3 px-3 text-cyan-300">AQUILA OS (Proposed)</td>
                <td className="py-3 px-3 text-emerald-400">₹75,000 – ₹3.2 Lakhs</td>
                <td className="py-3 px-3">6,000m (Ti-Gr5)</td>
                <td className="py-3 px-3">&lt;1.2m/km (ADCP EKF)</td>
                <td className="py-3 px-3 text-cyan-300">100 TOPS YOLOv8s INT8</td>
                <td className="py-3 px-3 text-blue-300">ISRO INSAT-3DR / NavIC</td>
                <td className="py-3 px-3 text-emerald-400">100% Domestic (MoES)</td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-3 px-3 font-semibold text-slate-200">Kongsberg HUGIN 6000</td>
                <td className="py-3 px-3 text-red-400">₹22 – ₹28 Crores</td>
                <td className="py-3 px-3">6,000m</td>
                <td className="py-3 px-3">&lt;1.0m/km (FOG INS)</td>
                <td className="py-3 px-3 text-slate-400">Post-Mission Only</td>
                <td className="py-3 px-3 text-slate-400">Iridium SBD (Paid USD)</td>
                <td className="py-3 px-3 text-red-400">100% Foreign Import</td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-3 px-3 font-semibold text-slate-200">Standard BGC-Argo Float</td>
                <td className="py-3 px-3 text-amber-400">₹28 – ₹35 Lakhs</td>
                <td className="py-3 px-3">2,000m</td>
                <td className="py-3 px-3 text-slate-400">Passive Oceanic Drift</td>
                <td className="py-3 px-3 text-slate-500">None (Microcontroller)</td>
                <td className="py-3 px-3 text-slate-400">Iridium Airtime (Paid)</td>
                <td className="py-3 px-3 text-amber-400">100% Foreign Import</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
