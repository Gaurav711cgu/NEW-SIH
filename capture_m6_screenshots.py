#!/usr/bin/env python3
"""
M6 Visual Verification & Screenshot Capture Harness
Captures high-resolution desktop and full-page screenshots for:
- OceanState (/ocean-state)
- GovernmentIntel (/gov-intel)
- ProposedSystem (/system-architecture)
- ResearchCitations (/research-citations)
- ProposedSystem Interactive Subsystem & Pipeline Inspection Cards
"""

import os
import sys
import time
import urllib.request
from playwright.sync_api import sync_playwright

WORKSPACE_ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(WORKSPACE_ROOT, ".agents", "orchestrator_7", "screenshots")
BASE_URL = "http://localhost:5173"

def check_server():
    try:
        res = urllib.request.urlopen(BASE_URL + "/ocean-state", timeout=2)
        if res.getcode() == 200:
            print("[SERVER] Vite dev server is active and responding 200 OK.")
            return True
    except Exception as e:
        print(f"[SERVER ERROR] Dev server check failed: {e}")
        return False
    return False

def run_captures():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not check_server():
        print("[ERROR] Server not reachable on port 5173.")
        sys.exit(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--enable-webgl",
                "--ignore-gpu-blocklist",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",
            ]
        )

        # -------------------------------------------------------------
        # 1. OCEAN STATE DASHBOARD
        # -------------------------------------------------------------
        print("\n[1/5] Capturing Ocean State Dashboard...")
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(f"{BASE_URL}/ocean-state", wait_until="networkidle")
        page.wait_for_timeout(2000)
        
        path_ocean_1080 = os.path.join(OUTPUT_DIR, "screenshot_ocean_state.png")
        page.screenshot(path=path_ocean_1080)
        print(f"  -> Saved desktop: {path_ocean_1080}")

        # Full-page variant
        sh = page.evaluate("() => { const el = document.querySelector('main > div'); return el ? el.scrollHeight : 1080; }")
        page.set_viewport_size({"width": 1920, "height": max(1080, sh)})
        page.wait_for_timeout(500)
        path_ocean_fp = os.path.join(OUTPUT_DIR, "screenshot_ocean_state_fullpage.png")
        page.screenshot(path=path_ocean_fp)
        print(f"  -> Saved fullpage: {path_ocean_fp}")
        page.close()

        # -------------------------------------------------------------
        # 2. GOVERNMENT INTEL REPORT
        # -------------------------------------------------------------
        print("\n[2/5] Capturing Government Intel Report...")
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(f"{BASE_URL}/gov-intel", wait_until="networkidle")
        page.wait_for_timeout(2000)
        
        path_gov_1080 = os.path.join(OUTPUT_DIR, "screenshot_gov_intel.png")
        page.screenshot(path=path_gov_1080)
        print(f"  -> Saved desktop: {path_gov_1080}")

        # Full-page variant
        sh = page.evaluate("() => { const el = document.querySelector('main > div'); return el ? el.scrollHeight : 1080; }")
        page.set_viewport_size({"width": 1920, "height": max(1080, sh)})
        page.wait_for_timeout(500)
        path_gov_fp = os.path.join(OUTPUT_DIR, "screenshot_gov_intel_fullpage.png")
        page.screenshot(path=path_gov_fp)
        print(f"  -> Saved fullpage: {path_gov_fp}")
        page.close()

        # -------------------------------------------------------------
        # 3. PROPOSED SYSTEM (SYSTEM ARCHITECTURE)
        # -------------------------------------------------------------
        print("\n[3/5] Capturing Proposed System Architecture...")
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(f"{BASE_URL}/system-architecture", wait_until="networkidle")
        page.wait_for_timeout(2000)
        
        path_proposed_1080 = os.path.join(OUTPUT_DIR, "screenshot_proposed_system.png")
        page.screenshot(path=path_proposed_1080)
        print(f"  -> Saved desktop: {path_proposed_1080}")

        # Full-page variant
        sh = page.evaluate("() => { const el = document.querySelector('main > div'); return el ? el.scrollHeight : 1080; }")
        page.set_viewport_size({"width": 1920, "height": max(1080, sh)})
        page.wait_for_timeout(500)
        path_proposed_fp = os.path.join(OUTPUT_DIR, "screenshot_proposed_system_fullpage.png")
        page.screenshot(path=path_proposed_fp)
        print(f"  -> Saved fullpage: {path_proposed_fp}")
        page.close()

        # -------------------------------------------------------------
        # 4. PROPOSED SYSTEM (INTERACTIVE HARDWARE INSPECTION)
        # -------------------------------------------------------------
        print("\n[4/5] Capturing Proposed System Interactive Subsystem Drawer...")
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(f"{BASE_URL}/system-architecture", wait_until="networkidle")
        page.wait_for_timeout(1500)

        # Click on the SSS array or Chlorophyll fluorometer button to open deep card
        target_btn = page.locator('button:has-text("Klein Marine Systems 3900")')
        target_btn.click()
        page.wait_for_timeout(500)

        # Scroll down so the inspection card is centrally framed
        page.evaluate('''() => {
            const scrollContainer = document.querySelector('main > div');
            if (scrollContainer) scrollContainer.scrollTop = 700;
        }''')
        page.wait_for_timeout(800)

        path_interactive = os.path.join(OUTPUT_DIR, "screenshot_proposed_system_interactive.png")
        page.screenshot(path=path_interactive)
        print(f"  -> Saved interactive subsystem card: {path_interactive}")

        # Also capture interactive Edge AI pipeline stage
        page.evaluate('''() => {
            const scrollContainer = document.querySelector('main > div');
            if (scrollContainer) scrollContainer.scrollTop = 1600;
        }''')
        page.wait_for_timeout(500)
        # Click Stage 2 or Stage 4
        stg_btn = page.locator('text=02 // PROCESSING')
        if stg_btn.count() > 0:
            stg_btn.first.click()
            page.wait_for_timeout(500)
        path_stage_interactive = os.path.join(OUTPUT_DIR, "screenshot_proposed_system_interactive_stage.png")
        page.screenshot(path=path_stage_interactive)
        print(f"  -> Saved interactive Edge AI pipeline stage: {path_stage_interactive}")
        page.close()

        # -------------------------------------------------------------
        # 5. RESEARCH CITATIONS DOSSIER
        # -------------------------------------------------------------
        print("\n[5/5] Capturing Research Citations Dossier...")
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(f"{BASE_URL}/research-citations", wait_until="networkidle")
        page.wait_for_timeout(2000)

        path_research_1080 = os.path.join(OUTPUT_DIR, "screenshot_research_citations.png")
        page.screenshot(path=path_research_1080)
        print(f"  -> Saved desktop: {path_research_1080}")

        # Full-page variant
        sh = page.evaluate("() => { const el = document.querySelector('main > div'); return el ? el.scrollHeight : 1080; }")
        page.set_viewport_size({"width": 1920, "height": max(1080, sh)})
        page.wait_for_timeout(500)
        path_research_fp = os.path.join(OUTPUT_DIR, "screenshot_research_citations_fullpage.png")
        page.screenshot(path=path_research_fp)
        print(f"  -> Saved fullpage: {path_research_fp}")
        page.close()

        browser.close()
        print("\n[COMPLETE] All screenshots successfully captured.")

if __name__ == "__main__":
    run_captures()
