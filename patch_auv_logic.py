import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# Fix Camera position for OBSERVATION to be much closer so sensors are easy to click
content = content.replace(
    "case 'OBSERVATION': cameraRef.current.position.set(6.0, 2.0, 6.0); break;",
    "case 'OBSERVATION': cameraRef.current.position.set(3.5, 1.0, 3.5); cameraRef.current.lookAt(0,0,0); break;"
)

# Completely rewrite the OBSERVATION useEffect to be highly detailed
old_effect = """  useEffect(() => {
    if (viewPreset !== 'OBSERVATION') return;
    
    let currentDepth = 0;
    const interval = setInterval(() => {
      currentDepth += 5;
      if (currentDepth > 500) currentDepth = 0;
      
      const temp = 1.5 - (currentDepth / 200);
      const sal = 34.00 + (currentDepth / 1000);
      const dox = 250 - (currentDepth / 5);
      const silicate = 60.0 + (currentDepth / 10);
      const dms = 2.1 - (currentDepth / 500); // DMS higher at surface
      
      const isFailure = Math.random() < 0.05;
      const finalSal = isFailure ? 12.0 : sal;
      const flag = isFailure ? 4 : 1;
      const density = isFailure ? 980.5 : 1027.0 + (currentDepth / 500);

      setObsDepth(currentDepth);
      setObsTemp(temp);
      setObsSal(finalSal);
      setObsDO(dox);
      setObsSilicate(silicate);
      setObsDMS(dms);
      setObsDensity(density);
      setObsFlag(flag);

      setObsLogs(prev => {
        const newLogs = [...prev, `[TEOS-10] Calculated Density: ${density.toFixed(2)} kg/m³`];
        if (isFailure) {
          newLogs.push(`[CRITICAL] THERMODYNAMIC VIOLATION! Salinity ${finalSal.toFixed(2)} PSU is impossible.`);
          newLogs.push(`[REJECTED] FLAG 4 - Packet Dropped.`);
        } else {
          newLogs.push(`[VALID] FLAG 1 - Nominal. Stored to DB.`);
        }
        if (newLogs.length > 8) return newLogs.slice(newLogs.length - 8);
        return newLogs;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [viewPreset]);"""

new_effect = """  useEffect(() => {
    if (viewPreset !== 'OBSERVATION') return;
    
    let currentDepth = 0;
    const interval = setInterval(() => {
      currentDepth += 10;
      if (currentDepth > 500) currentDepth = 0;
      
      const temp = 1.5 - (currentDepth / 200);
      let sal = 34.00 + (currentDepth / 1000);
      const dox = 250 - (currentDepth / 5);
      const silicate = 60.0 + (currentDepth / 10);
      const dms = 2.1 - (currentDepth / 500); 
      
      // 3 possible states: Normal, Hardware Fail, Meltwater Anomaly
      const rand = Math.random();
      let isFailure = false;
      let isAnomaly = false;
      let flag = 1;
      let density = 1027.0 + (currentDepth / 500);

      if (rand < 0.08) {
         isFailure = true;
         sal = 5.0; // Impossible ocean salinity -> broken sensor
         flag = 4;
         density = 980.0;
      } else if (rand > 0.90) {
         isAnomaly = true;
         sal = 28.5; // Huge drop, but physically possible (Meltwater!)
         density = 1018.5; // Lighter density
      }

      setObsDepth(currentDepth);
      setObsTemp(temp);
      setObsSal(sal);
      setObsDO(dox);
      setObsSilicate(silicate);
      setObsDMS(dms);
      setObsDensity(density);
      setObsFlag(flag);

      setObsLogs(prev => {
        const newLogs = [...prev];
        newLogs.push(`> [I2C] Scanning at ${currentDepth}m... T:${temp.toFixed(1)}°C | S:${sal.toFixed(1)} PSU`);
        newLogs.push(`> [TEOS-10] Verifying Absolute Salinity & Conservative Temp...`);
        
        if (isFailure) {
          newLogs.push(`[FATAL] Hardware Sensor Error! Salinity ${sal.toFixed(1)} is thermodynamically impossible here.`);
          newLogs.push(`[REJECTED] QC FLAG 4 (Bad Data) Applied.`);
        } else if (isAnomaly) {
          newLogs.push(`[AI ALERT] Sudden -5 PSU Density Gradient Detected!`);
          newLogs.push(`[WARNING] Isolation Forest flags Subglacial Meltwater Flux anomaly.`);
          newLogs.push(`[SAVED] QC FLAG 1 - Geotagging anomaly location...`);
        } else {
          newLogs.push(`[VALID] Density ${density.toFixed(2)} kg/m³ verified. QC FLAG 1.`);
        }
        newLogs.push(`----------------------------------------`);
        
        if (newLogs.length > 12) return newLogs.slice(newLogs.length - 12);
        return newLogs;
      });
      
      // Move camera slightly to simulate sinking/diving
      if (cameraRef.current) {
          cameraRef.current.position.y = 1.0 + Math.sin(Date.now()*0.001)*0.2;
      }

    }, 2500);

    return () => clearInterval(interval);
  }, [viewPreset]);"""

content = content.replace(old_effect, new_effect)

# Fix bottom terminal height/layout so it doesn't block clicks
content = content.replace(
    'className="absolute bottom-6 right-6 w-80 bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"',
    'className="absolute bottom-6 right-6 w-[28rem] bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"'
)
content = content.replace('h-32', 'h-48')

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)
