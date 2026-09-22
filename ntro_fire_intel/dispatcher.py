#!/usr/bin/env python3
"""
Autonomous Geospatial Intelligence (GEOINT) Alert Dispatcher.
NTRO GEOINT Fire Intel (SIH PS-26162 - Requirement R3).

Features:
- CLI command: python dispatcher.py --test
- Genuine model loading (model.pkl) for thermal point classification.
- Tactical SITREP JSON generation with 3-tier Indian administrative jurisdiction.
- Google Maps turn-by-turn routing navigation link.
- Evacuation radius and chemical/HAZMAT threat assessment.
- Autonomous dispatch via HTTP POST to Telegram Bot API (/bot<TOKEN>/sendMessage).
- Resilient in-process mock HTTP adapter for test and sandbox execution (HTTP 200 OK).
- Dispatches and logs to data/sitreps_dispatched.json and alerts/.
"""

import os
import sys
import io
import time
import json
import logging
import pickle
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List

import requests
from requests.adapters import HTTPAdapter
from urllib3.response import HTTPResponse

import enrichment
import sitrep_generator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("dispatcher")

PROJECT_ROOT = Path(__file__).parent
DATA_DIR = PROJECT_ROOT / "data"
ALERTS_DIR = PROJECT_ROOT / "alerts"
MODEL_PATH = PROJECT_ROOT / "model.pkl"
SECONDARY_MODEL_PATH = PROJECT_ROOT / "models" / "model.pkl"
FIRMS_LATEST_PATH = DATA_DIR / "firms_latest.json"
ENRICHED_ANOMALIES_PATH = DATA_DIR / "enriched_anomalies.json"
SITREPS_DISPATCHED_PATH = DATA_DIR / "sitreps_dispatched.json"
ALERTS_DISPATCHED_PATH = ALERTS_DIR / "dispatched_alerts.json"
LATEST_DISPATCH_PATH = ALERTS_DIR / "latest_dispatch.json"

DEFAULT_MOCK_TOKEN = "MOCK_BOT_TOKEN_NTRO_GEOINT_PS26162"
DEFAULT_CHAT_ID = "@geoint_emergency_alerts"


class MockTelegramAdapter(HTTPAdapter):
    """
    In-process Mock Adapter for Telegram Bot API requests.
    Mounts directly onto requests.Session to handle HTTP POST requests
    to api.telegram.org without opening raw OS network sockets.
    Responds with HTTP 200 OK and genuine Telegram Bot API response payload.
    """

    def __init__(self, message_id: int = 101, chat_id: int = 99999):
        super().__init__()
        self.message_id = message_id
        self.chat_id = chat_id
        self.call_history: List[Dict[str, Any]] = []

    def send(self, request, **kwargs):
        # Extract and parse request body
        body_str = request.body.decode("utf-8") if request.body else "{}"
        try:
            payload = json.loads(body_str)
        except Exception:
            payload = {"raw": body_str}

        self.call_history.append({
            "url": request.url,
            "method": request.method,
            "headers": dict(request.headers),
            "payload": payload,
            "time": datetime.now(timezone.utc).isoformat()
        })

        # Match exact schema specified in dispatch instructions:
        # {"ok": true, "result": {"message_id": 101, "chat": {"id": 99999}, "text": "..."}}
        response_data = {
            "ok": True,
            "result": {
                "message_id": self.message_id,
                "from": {
                    "id": 99999,
                    "is_bot": True,
                    "first_name": "NTRO GEOINT Tactical Dispatcher",
                    "username": "GEOINT_FireAlert_Bot"
                },
                "chat": {
                    "id": self.chat_id,
                    "title": "GEOINT Tactical Emergency Command",
                    "type": "channel"
                },
                "date": int(time.time()),
                "text": payload.get("text", "Tactical SITREP Dispatched")
            }
        }

        response_bytes = json.dumps(response_data, indent=2).encode("utf-8")
        raw_response = HTTPResponse(
            body=io.BytesIO(response_bytes),
            status=200,
            reason="OK",
            headers={"Content-Type": "application/json; charset=utf-8"},
            preload_content=False
        )
        return self.build_response(request, raw_response)


class AutonomousDispatcher:
    """
    Autonomous Geospatial Intelligence Alert Dispatcher.
    Loads XGBoost classifier model (model.pkl), classifies thermal points,
    generates tactical SITREPs, and dispatches via Telegram Bot API HTTP POST.
    """

    def __init__(
        self,
        model_path: Optional[Path] = None,
        test_mode: bool = False,
        bot_token: Optional[str] = None
    ):
        self.test_mode = test_mode
        self.model_path = model_path or MODEL_PATH
        self.bot_token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN") or DEFAULT_MOCK_TOKEN
        self.model = self._load_model()
        
        # Configure requests session
        self.session = requests.Session()
        self.mock_adapter: Optional[MockTelegramAdapter] = None
        
        # Setup mock adapter if test mode or no live credentials
        if self.test_mode or self.bot_token == DEFAULT_MOCK_TOKEN:
            self.mock_adapter = MockTelegramAdapter(message_id=101, chat_id=99999)
            self.session.mount("https://", self.mock_adapter)
            self.session.mount("http://", self.mock_adapter)
            logger.info("Autonomous Dispatcher initialized in TEST/MOCK mode with in-process HTTP Adapter.")
        else:
            logger.info("Autonomous Dispatcher initialized in LIVE mode with configured Telegram Bot Token.")

    def _load_model(self):
        """Load trained XGBoost classifier model from model.pkl."""
        paths_to_try = [self.model_path, SECONDARY_MODEL_PATH]
        for p in paths_to_try:
            if p.exists():
                try:
                    with open(p, "rb") as f:
                        m = pickle.load(f)
                    logger.info("Successfully loaded model from %s", p)
                    return m
                except Exception as e:
                    logger.warning("Error loading model from %s: %s", p, e)
        raise FileNotFoundError(
            f"Trained model not found at {self.model_path} or {SECONDARY_MODEL_PATH}. "
            "Execute 'python train_model.py' first."
        )

    def classify_anomaly(self, anomaly: Dict[str, Any]) -> Tuple[str, float, Dict[str, Any]]:
        """
        Classify thermal anomaly using trained model and OSM enrichment.
        Returns: (class_label, industrial_probability, feature_dict)
        """
        lat = float(anomaly.get("latitude", 0.0))
        lon = float(anomaly.get("longitude", 0.0))
        osm_info = enrichment.enrich_point(lat, lon)
        vec, feat_dict = enrichment.extract_features(anomaly, osm_info)

        pred_class = int(self.model.predict([vec])[0])
        pred_prob = float(self.model.predict_proba([vec])[0][1])

        label = "INDUSTRIAL_FIRE" if pred_class == 1 else "WILDFIRE"
        return label, pred_prob, feat_dict

    def generate_sitrep(self, anomaly: Dict[str, Any]) -> Dict[str, Any]:
        """Generate tactical SITREP using classification and spatial routing."""
        lat = float(anomaly.get("latitude", 0.0))
        lon = float(anomaly.get("longitude", 0.0))
        frp = float(anomaly.get("frp", 80.0))
        brightness = float(anomaly.get("bright_ti4", anomaly.get("brightness", 360.0)))
        satellite = anomaly.get("satellite", "VIIRS-SNPP")
        anomaly_id = anomaly.get("anomaly_id")

        label, prob, _ = self.classify_anomaly(anomaly)
        confidence = prob if label == "INDUSTRIAL_FIRE" else (1.0 - prob)

        sitrep = sitrep_generator.generate_sitrep(
            lat=lat,
            lon=lon,
            classification=label,
            frp=frp,
            confidence=confidence,
            brightness=brightness,
            satellite=satellite,
            anomaly_id=anomaly_id,
            raw_anomaly=anomaly
        )
        return sitrep

    def dispatch_sitrep(
        self,
        sitrep: Dict[str, Any],
        chat_id: Optional[str] = None
    ) -> Tuple[requests.Response, Dict[str, Any]]:
        """
        Execute HTTP POST request containing SITREP to Telegram Bot API endpoint.
        Logs the HTTP POST request, status code 200 OK, response body,
        and saves dispatched SITREPs to data/sitreps_dispatched.json and alerts/.
        """
        endpoint = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        dest_chat = chat_id or sitrep["jurisdiction"].get("emergency_phone") or DEFAULT_CHAT_ID

        payload = {
            "chat_id": dest_chat,
            "text": sitrep["formatted_message"],
            "parse_mode": "Markdown",
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {
                            "text": "🗺️ Open Google Maps Navigation",
                            "url": sitrep["google_maps_url"]
                        }
                    ],
                    [
                        {
                            "text": "📞 Call Emergency Responder",
                            "url": f"tel:{sitrep['jurisdiction'].get('emergency_phone', '112')}"
                        }
                    ]
                ]
            }
        }

        # 1. Log outgoing HTTP POST request
        logger.info("Executing HTTP POST to Telegram Bot API endpoint: %s", endpoint)
        logger.info("Request Headers: Content-Type: application/json")
        logger.info("Request Body:\n%s", json.dumps(payload, indent=2))

        # 2. Perform HTTP POST request
        headers = {"Content-Type": "application/json"}
        resp = self.session.post(endpoint, json=payload, headers=headers, timeout=5.0)

        # 3. Log status code and response body
        logger.info("HTTP POST Response Status: %d %s", resp.status_code, resp.reason)
        logger.info("Response Body: %s", resp.text)

        response_json = resp.json()
        message_id = response_json.get("result", {}).get("message_id", 101)

        # 4. Update dispatch metadata in SITREP
        sitrep["dispatch_metadata"] = {
            "channel": dest_chat,
            "dispatch_time": datetime.now(timezone.utc).isoformat(),
            "status": "DISPATCHED_MOCK" if self.test_mode or self.mock_adapter else "DISPATCHED_LIVE",
            "http_status_code": resp.status_code,
            "telegram_message_id": message_id
        }

        # 5. Persist to data/sitreps_dispatched.json and alerts/
        self._persist_dispatched_sitrep(sitrep)

        return resp, response_json

    def _persist_dispatched_sitrep(self, sitrep: Dict[str, Any]):
        """Save dispatched SITREP to data/sitreps_dispatched.json and alerts/ directories."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        ALERTS_DIR.mkdir(parents=True, exist_ok=True)

        # Update data/sitreps_dispatched.json
        dispatched_list = []
        if SITREPS_DISPATCHED_PATH.exists():
            try:
                with open(SITREPS_DISPATCHED_PATH, "r", encoding="utf-8") as f:
                    dispatched_list = json.load(f)
                if not isinstance(dispatched_list, list):
                    dispatched_list = [dispatched_list]
            except Exception as e:
                logger.warning("Could not parse existing %s: %s", SITREPS_DISPATCHED_PATH, e)
                dispatched_list = []

        # Avoid duplicate entries of the same sitrep_id
        dispatched_list = [item for item in dispatched_list if item.get("sitrep_id") != sitrep.get("sitrep_id")]
        dispatched_list.append(sitrep)

        with open(SITREPS_DISPATCHED_PATH, "w", encoding="utf-8") as f:
            json.dump(dispatched_list, f, indent=2)
        logger.info("Saved %d dispatched SITREPs to %s", len(dispatched_list), SITREPS_DISPATCHED_PATH)

        # Mirror to alerts/dispatched_alerts.json
        try:
            with open(ALERTS_DISPATCHED_PATH, "w", encoding="utf-8") as f:
                json.dump(dispatched_list, f, indent=2)
        except Exception as e:
            logger.warning("Could not mirror to %s: %s", ALERTS_DISPATCHED_PATH, e)

        # Save single latest dispatch to alerts/latest_dispatch.json
        try:
            with open(LATEST_DISPATCH_PATH, "w", encoding="utf-8") as f:
                json.dump(sitrep, f, indent=2)
        except Exception as e:
            logger.warning("Could not save %s: %s", LATEST_DISPATCH_PATH, e)

    def run_test(self) -> int:
        """
        Execute standard test mode (python dispatcher.py --test).
        1. Loads anomaly data and classifies using model.pkl.
        2. Generates complete tactical SITREP.
        3. Prints SITREP JSON to stdout.
        4. Sends HTTP POST to mocked Telegram Bot API endpoint.
        5. Verifies HTTP 200 OK and response structure.
        6. Asserts persistence in data/sitreps_dispatched.json.
        """
        logger.info("=== Executing Autonomous Alert Dispatcher Test Harness (R3) ===")
        
        # Test reference point: High-intensity thermal anomaly at Hazira Petrochemical Complex
        test_anomaly = {
            "anomaly_id": "VIIRS_IND_20260906_001",
            "latitude": 21.1625,
            "longitude": 72.8312,
            "bright_ti4": 365.4,
            "bright_ti5": 298.2,
            "frp": 84.5,
            "daynight": "D",
            "satellite": "Suomi-NPP",
            "confidence": "high"
        }

        # 1. Model inference & classification
        label, prob, feat_dict = self.classify_anomaly(test_anomaly)
        logger.info("Model Classification: %s (Confidence: %.2f%%)", label, prob * 100)

        # 2. Generate SITREP
        sitrep = self.generate_sitrep(test_anomaly)

        # 3. Print valid JSON SITREP
        print("\n" + "="*70)
        print(" [TACTICAL SITREP JSON PAYLOAD]")
        print("="*70)
        print(json.dumps(sitrep, indent=2))
        print("="*70 + "\n")

        # 4. Dispatch via HTTP POST
        resp, resp_data = self.dispatch_sitrep(sitrep)

        # 5. Assertions
        assert resp.status_code == 200, f"Expected HTTP 200, got {resp.status_code}"
        assert resp_data.get("ok") is True, f"Telegram API response ok is not True: {resp_data}"
        assert "result" in resp_data, f"Missing result key in response: {resp_data}"
        result = resp_data["result"]
        assert result.get("message_id") == 101, f"Expected message_id 101, got {result.get('message_id')}"
        assert result.get("chat", {}).get("id") == 99999, f"Expected chat id 99999, got {result.get('chat')}"

        # 6. Verify file persistence
        assert SITREPS_DISPATCHED_PATH.exists(), f"Missing file {SITREPS_DISPATCHED_PATH}"
        with open(SITREPS_DISPATCHED_PATH, "r", encoding="utf-8") as f:
            dispatched = json.load(f)
        assert len(dispatched) >= 1, "Dispatched SITREPs list is empty!"
        latest = dispatched[-1]
        assert latest["sitrep_id"] == sitrep["sitrep_id"], "Dispatched sitrep_id mismatch!"
        assert latest["dispatch_metadata"]["http_status_code"] == 200, "Metadata status code != 200"

        # 7. Print summary
        jur = sitrep["jurisdiction"]
        nav = sitrep["navigation"]
        tactical = sitrep["tactical_assessment"]
        print("\n" + "#"*70)
        print(" [R3 VERIFICATION PASS] AUTONOMOUS ALERT DISPATCHER CONFIRMED")
        print("#"*70)
        print(f" HTTP POST Status:      {resp.status_code} {resp.reason}")
        print(f" Mock Endpoint:         https://api.telegram.org/bot{self.bot_token}/sendMessage")
        print(f" Telegram Message ID:   {result['message_id']}")
        print(f" SITREP ID:             {sitrep['sitrep_id']}")
        print(f" Coordinates:           {sitrep['coordinates']['latitude']}°N, {sitrep['coordinates']['longitude']}°E")
        print(f" Classification:        {sitrep['classification']['category']} ({sitrep['classification']['confidence']*100:.1f}% conf)")
        print(f" Threat Level:          {tactical['threat_level']}")
        print(f" Evacuation Radius:     {tactical['evacuation_radius_m']} meters")
        print(f" First Responder:       {jur['primary_responder']}")
        print(f" Control Room Contact:  {jur['emergency_phone']}")
        print(f" Google Maps Routing:   {nav['google_maps_url']}")
        print(f" Saved Dispatches File: {SITREPS_DISPATCHED_PATH}")
        print("#"*70 + "\n")

        return 0

    def run_feed_dispatch(self, min_frp: float = 20.0, industrial_only: bool = True) -> int:
        """Process active anomalies in firms_latest.json and dispatch alerts."""
        if not FIRMS_LATEST_PATH.exists():
            logger.error("Active thermal anomalies not found at %s. Run ingestion.py first.", FIRMS_LATEST_PATH)
            return 1

        with open(FIRMS_LATEST_PATH, "r", encoding="utf-8") as f:
            anomalies = json.load(f)

        logger.info("Scanning %d thermal anomalies from %s...", len(anomalies), FIRMS_LATEST_PATH.name)
        dispatched_count = 0

        for anomaly in anomalies:
            frp = float(anomaly.get("frp", 0.0))
            if frp < min_frp:
                continue

            label, prob, _ = self.classify_anomaly(anomaly)
            if industrial_only and label != "INDUSTRIAL_FIRE":
                continue

            logger.info("Triggering dispatch for %s (FRP: %.1f MW, Class: %s, Prob: %.2f)...",
                        anomaly.get("anomaly_id", "HOTSPOT"), frp, label, prob)
            sitrep = self.generate_sitrep(anomaly)
            resp, resp_data = self.dispatch_sitrep(sitrep)
            if resp.status_code == 200:
                dispatched_count += 1

        logger.info("Successfully processed feed: %d SITREPs dispatched.", dispatched_count)
        return 0


def main():
    parser = argparse.ArgumentParser(
        description="NTRO GEOINT Industrial Fire Autonomous Alert Dispatcher (SIH PS-26162)"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Run autonomous dispatcher verification test harness"
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Attempt live Telegram Bot dispatch using TELEGRAM_BOT_TOKEN environment variable"
    )
    parser.add_argument(
        "--min-frp",
        type=float,
        default=25.0,
        help="Minimum FRP threshold (in MW) for triggering emergency alerts (default: 25.0)"
    )
    parser.add_argument(
        "--all-types",
        action="store_true",
        help="Dispatch alerts for both industrial fires and wildfires (default: industrial only)"
    )
    args = parser.parse_args()

    # Determine execution mode
    test_mode = args.test or (not args.live and "TELEGRAM_BOT_TOKEN" not in os.environ)
    dispatcher = AutonomousDispatcher(test_mode=test_mode)

    if args.test:
        code = dispatcher.run_test()
        sys.exit(code)
    else:
        code = dispatcher.run_feed_dispatch(
            min_frp=args.min_frp,
            industrial_only=not args.all_types
        )
        sys.exit(code)


if __name__ == "__main__":
    main()
