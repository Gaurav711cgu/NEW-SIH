// Verification test suite for dispatch logic, formulas, and NDRF registry
import assert from 'node:assert';

// Import from the built bundle or test the exact logic
import { 
  REAL_WORLD_NDRF_BATTALIONS, 
  SETTLEMENT_PROFILES, 
  NDMA_SOP_RULES,
  FALLBACK_STORM_CELLS,
  calculateHaversineDistanceKm,
  calculateImpactedDemographics,
  calculateBuildingVulnerability,
  calculateBattalionProximity,
  createDispatchedAlert
} from '../../../convectnow/frontend/src/types/dispatch.ts';

console.log('Testing Dispatch Logic and Mathematical Models...');

// 1. Test Haversine Distance
const d1 = calculateHaversineDistanceKm(28.6139, 77.2090, 28.6942, 77.4478); // Delhi to Ghaziabad 8th BN
console.log(`Delhi to Ghaziabad 8th BN: ${d1} km`);
assert(d1 > 20 && d1 < 30, `Expected distance ~25 km, got ${d1}`);

// 2. Test NDRF Battalion Registry
console.log(`NDRF Battalions count: ${REAL_WORLD_NDRF_BATTALIONS.length}`);
assert(REAL_WORLD_NDRF_BATTALIONS.length >= 16, 'Expected at least 16 NDRF battalions');
const ghaziabadBn = REAL_WORLD_NDRF_BATTALIONS.find(b => b.id === 'NDRF-BN-08');
assert(ghaziabadBn, 'Expected NDRF-BN-08 in registry');
assert.strictEqual(ghaziabadBn.state, 'Uttar Pradesh / Delhi-NCR');

// 3. Test Proximity Sorting
const stormLat = 17.785;
const stormLon = 83.245;
const rankedBns = calculateBattalionProximity(stormLat, stormLon, false);
console.log(`Top nearest battalion to storm (${stormLat}, ${stormLon}): ${rankedBns[0].battalion.name} (${rankedBns[0].roadDistanceKm} km, ETA ${rankedBns[0].totalEtaMinutes} min)`);
assert(rankedBns.length >= 16, 'Expected all battalions ranked');
assert(rankedBns[0].totalEtaMinutes <= rankedBns[1].totalEtaMinutes, 'Battalions must be sorted ascending by total ETA');

// 4. Test Impacted Demographics calculation
const cell1 = FALLBACK_STORM_CELLS[0];
const demo = calculateImpactedDemographics(cell1, 20, 'MDU');
console.log(`Demographics for ${cell1.cell_id}: Total Exposed=${demo.totalExposedPopulation}, Critical=${demo.criticalJeopardyPopulation}, Evacuation=${demo.recommendedEvacuationCount}`);
assert(demo.totalExposedPopulation > 0, 'Exposed population must be > 0');
assert(demo.criticalJeopardyPopulation > 0, 'Critical jeopardy must be > 0');
assert(demo.criticalJeopardyPopulation <= demo.totalExposedPopulation, 'Critical jeopardy cannot exceed total exposed');
assert(demo.recommendedEvacuationCount <= demo.criticalJeopardyPopulation, 'Evacuation count cannot exceed critical jeopardy');

// 5. Test Building Vulnerability calculation
const vuln = calculateBuildingVulnerability(demo, cell1.hazards, 'MDU');
console.log(`Building Vulnerability: Type A Kutcha failure risk=${vuln.typeA_kutcha.failureRiskPct}%, Type B Semi-Pucca=${vuln.typeB_semiPucca.failureRiskPct}%, Type C Pucca=${vuln.typeC_puccaRcc.failureRiskPct}%`);
assert(vuln.typeA_kutcha.failureRiskPct >= 75, 'Type A Kutcha must have high failure risk');
assert(vuln.typeA_kutcha.failureRiskPct > vuln.typeB_semiPucca.failureRiskPct, 'Kutcha risk must be higher than semi-pucca');
assert(vuln.typeB_semiPucca.failureRiskPct > vuln.typeC_puccaRcc.failureRiskPct, 'Semi-pucca risk must be higher than pucca RCC');

// 6. Test NDMA SOP Rules
console.log(`NDMA SOP rules count: ${NDMA_SOP_RULES.length}`);
assert(NDMA_SOP_RULES.length >= 4, 'Must have at least 4 NDMA SOP rules');
NDMA_SOP_RULES.forEach(sop => {
  assert(sop.titleEn.length > 0, 'SOP must have English title');
  assert(sop.titleHi.length > 0, 'SOP must have Hindi title');
  assert(sop.instructionEn.length > 0, 'SOP must have English instruction');
  assert(sop.instructionHi.length > 0, 'SOP must have Hindi instruction');
  assert(sop.highlightEn.length > 0, 'SOP must have English highlight');
  assert(sop.highlightHi.length > 0, 'SOP must have Hindi highlight');
});

// 7. Test DispatchedAlert creation
const alert = createDispatchedAlert(cell1, 25, 'MDU');
console.log(`Dispatched Alert ID: ${alert.alertId}, Threat Level: ${alert.threatLevel}, Location: ${alert.targetLocation}`);
assert(alert.alertId.startsWith('MAUSAM-NDMA-'), 'Alert ID must follow naming schema');
assert.strictEqual(alert.cellId, cell1.cell_id);
assert(alert.nearestShelter.name.length > 0, 'Nearest shelter must have name');
assert(alert.assignedBattalions.length > 0, 'Must have assigned response battalions');
assert(alert.emergencyHelplines.length >= 3, 'Must have emergency helplines');

console.log('✅ ALL DISPATCH LOGIC TESTS PASSED SUCCESSFULLY!');
