#!/usr/bin/env python3
"""
Unit and Integration Tests for Autonomous GEOINT Dispatcher & SITREP Generator.
SIH PS-26162 (Requirement R3)
"""

import os
import json
import unittest
from pathlib import Path

import sitrep_generator
import dispatcher

PROJECT_ROOT = Path(__file__).parent

class TestSitrepGenerator(unittest.TestCase):
    def test_sitrep_structure_and_keys(self):
        rep = sitrep_generator.generate_sitrep(21.1625, 72.8312, "INDUSTRIAL_FIRE", 84.5, 0.997)
        self.assertIn("google_maps_url", rep)
        self.assertIn("jurisdiction", rep)
        self.assertIn("coordinates", rep)
        self.assertIn("fire_radiative_power_mw", rep)
        self.assertIn("threat_level", rep)
        self.assertIn("confidence_score", rep)
        self.assertIn("evacuation_radius_meters", rep)
        self.assertIn("chemical_hazard_warning", rep)
        self.assertIn("navigation", rep)
        self.assertIn("tactical_assessment", rep)
        
        # Verify specific values
        self.assertEqual(rep["coordinates"]["latitude"], 21.1625)
        self.assertEqual(rep["coordinates"]["longitude"], 72.8312)
        self.assertEqual(rep["threat_level"], "CRITICAL")
        self.assertEqual(rep["evacuation_radius_meters"], 2000)
        self.assertEqual(rep["jurisdiction"]["district"], "Surat")
        self.assertEqual(rep["jurisdiction"]["state"], "Gujarat")
        self.assertTrue(rep["google_maps_url"].startswith("https://www.google.com/maps/dir/"))

    def test_rural_sitrep(self):
        rep = sitrep_generator.generate_sitrep(21.65, 86.35, "WILDFIRE", 18.0, 0.95)
        self.assertEqual(rep["classification"]["category"], "WILDFIRE")
        self.assertFalse(rep["classification"]["is_industrial"])
        self.assertEqual(rep["tactical_assessment"]["threat_level"], "LOW")
        self.assertEqual(rep["evacuation_radius_meters"], 500)

class TestDispatcher(unittest.TestCase):
    def setUp(self):
        self.disp = dispatcher.AutonomousDispatcher(test_mode=True)

    def test_model_loaded(self):
        self.assertIsNotNone(self.disp.model)

    def test_classification_positive(self):
        anomaly = {
            "latitude": 21.1625,
            "longitude": 72.8312,
            "frp": 84.5,
            "bright_ti4": 365.4,
            "bright_ti5": 298.2,
            "daynight": "D"
        }
        label, prob, _ = self.disp.classify_anomaly(anomaly)
        self.assertEqual(label, "INDUSTRIAL_FIRE")
        self.assertGreaterEqual(prob, 0.80)

    def test_dispatch_http_post_mock(self):
        sitrep = self.disp.generate_sitrep({
            "anomaly_id": "TEST_IND_001",
            "latitude": 21.1625,
            "longitude": 72.8312,
            "frp": 84.5
        })
        resp, resp_data = self.disp.dispatch_sitrep(sitrep)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp_data.get("ok"))
        self.assertEqual(resp_data.get("result", {}).get("message_id"), 101)
        self.assertEqual(resp_data.get("result", {}).get("chat", {}).get("id"), 99999)

    def test_run_test_cli_workflow(self):
        exit_code = self.disp.run_test()
        self.assertEqual(exit_code, 0)
        
        # Verify persistence
        out_file = PROJECT_ROOT / "data" / "sitreps_dispatched.json"
        self.assertTrue(out_file.exists())
        with open(out_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[-1]["dispatch_metadata"]["http_status_code"], 200)

if __name__ == "__main__":
    unittest.main()
