#!/usr/bin/env python3
"""
Automated End-to-End Visual Verification for ConvectNow MoES Dashboard
Reviewer Visual 2 — Playwright Test Suite
"""

import os
import sys
import time
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

FRONTEND_DIR = "/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend"
SCREENSHOT_DIR = "/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_visual_2/screenshots"
PORT = 5174
BASE_URL = f"http://localhost:{PORT}"

def is_server_running(url):
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return response.status == 200
    except Exception:
        return False

def wait_for_server(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        if is_server_running(url):
            return True
        time.sleep(1)
    return False

def main():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    server_process = None

    if not is_server_running(BASE_URL):
        print(f"[*] Starting Vite dev server on port {PORT}...")
        server_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=FRONTEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if not wait_for_server(BASE_URL, timeout=35):
            print("[!] Server failed to start in time. Check stdout/stderr:")
            if server_process:
                server_process.terminate()
            sys.exit(1)
        print("[+] Vite server is up and responding!")
    else:
        print("[+] Vite dev server is already running.")

    try:
        with sync_playwright() as p:
            print("[*] Launching Chromium headless browser...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                device_scale_factor=1.5
            )
            page = context.new_page()

            print(f"[*] Navigating to {BASE_URL}...")
            page.goto(BASE_URL, wait_until="networkidle")
            page.wait_for_timeout(2000)

            # Ensure we are in Tactical Command mode
            print("[*] Verifying Tactical Command interface...")
            tactical_btn = page.locator('button:has-text("Tactical Command")')
            if tactical_btn.count() > 0:
                tactical_btn.first.click()
                page.wait_for_timeout(500)

            # ----------------------------------------------------
            # SCREENSHOT 1: SDMA Disaster Intel Panel
            # ----------------------------------------------------
            print("[*] Step 1: Switching right sidebar to [ 🛡️ SDMA Disaster Intel ] tab...")
            intel_tab_btn = page.locator('button:has-text("SDMA Disaster Intel")')
            intel_tab_btn.wait_for(state="visible", timeout=10000)
            intel_tab_btn.click()
            page.wait_for_timeout(1000)

            # Verify components inside Admin Intelligence Panel using substring matching
            assert page.get_by_text("SDMA Intelligence & Alert Dispatch", exact=False).count() > 0, "SDMA Header not found"
            assert page.get_by_text("Demographic Risk & Population Exposure", exact=False).count() > 0, "Demographic Risk card not found"
            assert page.get_by_text("BMTPC Structural Building Vulnerability", exact=False).count() > 0, "BMTPC Vulnerability card not found"
            assert page.get_by_text("NDRF / SDRF Deployment Proximity", exact=False).count() > 0, "NDRF Proximity table not found"
            assert page.get_by_text("Target Broadcast Radius", exact=False).count() > 0, "Broadcast Radius selector not found"

            # Capture Screenshot 1a (Tactical view with top of SDMA panel)
            s1_top_path = os.path.join(SCREENSHOT_DIR, "screenshot_1a_sdma_intel_top.png")
            page.screenshot(path=s1_top_path, full_page=False)
            print(f"[+] Screenshot 1a captured: {s1_top_path}")

            # Now scroll the sidebar to show the bottom part: BMTPC, NDRF Proximity Table, Broadcast Slider, and Dispatch Button
            print("[*] Scrolling sidebar to reveal Proximity Table & Dispatch Button...")
            sidebar_scrollable = page.locator('.custom-scrollbar').first
            # Scroll inside the AdminIntelligencePanel container
            page.evaluate("""
                const panels = document.querySelectorAll('.custom-scrollbar');
                panels.forEach(p => {
                    p.scrollTop = p.scrollHeight / 2;
                });
            """)
            page.wait_for_timeout(600)

            s1_path = os.path.join(SCREENSHOT_DIR, "screenshot_1_sdma_intel_panel.png")
            page.screenshot(path=s1_path, full_page=False)
            print(f"[+] Screenshot 1 (SDMA Intel Panel with NDRF & Dispatch) captured: {s1_path}")

            # Scroll fully to bottom to show dispatch button and broadcast radius clearly
            page.evaluate("""
                const panels = document.querySelectorAll('.custom-scrollbar');
                panels.forEach(p => {
                    p.scrollTop = p.scrollHeight;
                });
            """)
            page.wait_for_timeout(600)
            s1_bottom_path = os.path.join(SCREENSHOT_DIR, "screenshot_1b_sdma_intel_bottom.png")
            page.screenshot(path=s1_bottom_path, full_page=False)
            print(f"[+] Screenshot 1b (SDMA Intel Bottom with Dispatch Button) captured: {s1_bottom_path}")

            # ----------------------------------------------------
            # SCREENSHOT 2: Dispatch Alert Triggered & Confirmation Banner
            # ----------------------------------------------------
            print("[*] Step 2: Triggering 'Dispatch Alert & Broadcast to Mausam App'...")
            dispatch_btn = page.locator('button:has-text("Dispatch Alert & Broadcast to Mausam App")')
            dispatch_btn.wait_for(state="visible", timeout=5000)
            dispatch_btn.click()
            page.wait_for_timeout(1000)

            # Scroll back up a bit so confirmation banner inside panel and top banner are both prominent
            page.evaluate("""
                const panels = document.querySelectorAll('.custom-scrollbar');
                panels.forEach(p => {
                    p.scrollTop = 0;
                });
            """)
            page.wait_for_timeout(600)

            # Verify active broadcast banners
            assert page.get_by_text("ALERT BROADCAST ACTIVE", exact=False).count() > 0, "Broadcast confirmation banner not found"
            assert page.get_by_text("BROADCAST ACTIVE", exact=False).count() > 0, "Floating top alert banner not found"

            s2_path = os.path.join(SCREENSHOT_DIR, "screenshot_2_alert_dispatched.png")
            page.screenshot(path=s2_path, full_page=False)
            print(f"[+] Screenshot 2 (Alert Dispatched & Banners) captured: {s2_path}")

            # ----------------------------------------------------
            # SCREENSHOT 3: Citizen Warning Interface (Mausam App POV - iPhone chassis)
            # ----------------------------------------------------
            print("[*] Step 3: Navigating to Citizen Warning Interface (Mausam App)...")
            citizen_nav_btn = page.locator('button:has-text("Mausam App (Citizen)")')
            citizen_nav_btn.wait_for(state="visible", timeout=5000)
            citizen_nav_btn.click()
            page.wait_for_timeout(1500)

            # Ensure phone chassis mode is active
            mobile_mode_btn = page.locator('button:has-text("Mobile Chassis")')
            if mobile_mode_btn.count() > 0:
                mobile_mode_btn.click()
                page.wait_for_timeout(500)

            # Verify key citizen interface elements
            assert page.get_by_text("INDIA METEOROLOGICAL DEPARTMENT", exact=False).count() > 0, "IMD branding not found"
            assert page.get_by_text("NDMA Mandatory Safety SOPs", exact=False).count() > 0, "NDMA SOPs not found"
            assert page.get_by_text("Designated Safe Shelter", exact=False).count() > 0, "Shelter GPS card not found"
            assert page.get_by_text("24x7 Emergency SOS Helplines", exact=False).count() > 0, "Helplines not found"

            s3_path = os.path.join(SCREENSHOT_DIR, "screenshot_3_citizen_iphone_warning.png")
            page.screenshot(path=s3_path, full_page=False)
            print(f"[+] Screenshot 3 (Citizen iPhone Warning) captured: {s3_path}")

            # Also scroll down inside phone screen to capture lower part (Shelter GPS & Helplines)
            page.evaluate("""
                const phoneBody = document.querySelector('.rounded-\\\\[52px\\\\] .custom-scrollbar');
                if (phoneBody) phoneBody.scrollTop = 350;
            """)
            page.wait_for_timeout(500)
            s3_shelter_path = os.path.join(SCREENSHOT_DIR, "screenshot_3b_citizen_shelter_helplines.png")
            page.screenshot(path=s3_shelter_path, full_page=False)
            print(f"[+] Screenshot 3b (Citizen Shelter & Helplines) captured: {s3_shelter_path}")

            # Reset phone scroll
            page.evaluate("""
                const phoneBody = document.querySelector('.rounded-\\\\[52px\\\\] .custom-scrollbar');
                if (phoneBody) phoneBody.scrollTop = 0;
            """)

            # ----------------------------------------------------
            # SCREENSHOT 4: Citizen Warning Interface in Hindi Language & Full View
            # ----------------------------------------------------
            print("[*] Step 4: Toggling Hindi Language...")
            hindi_btn = page.locator('button:has-text("हिंदी")')
            hindi_btn.wait_for(state="visible", timeout=5000)
            hindi_btn.click()
            page.wait_for_timeout(800)

            # Capture Hindi Phone chassis
            s4_hindi_phone = os.path.join(SCREENSHOT_DIR, "screenshot_4a_citizen_hindi_phone.png")
            page.screenshot(path=s4_hindi_phone, full_page=False)
            print(f"[+] Screenshot 4a (Hindi Phone) captured: {s4_hindi_phone}")

            # Toggle Full View mode for wide view
            print("[*] Step 4b: Toggling Full View mode...")
            full_view_btn = page.locator('button:has-text("Full View")')
            full_view_btn.wait_for(state="visible", timeout=5000)
            full_view_btn.click()
            page.wait_for_timeout(1000)

            s4_path = os.path.join(SCREENSHOT_DIR, "screenshot_4_citizen_hindi_fullview.png")
            page.screenshot(path=s4_path, full_page=False)
            print(f"[+] Screenshot 4 (Citizen Hindi Full View) captured: {s4_path}")

            browser.close()
            print("[+] All visual verifications executed successfully!")

    finally:
        if server_process:
            print("[*] Cleaning up background server process...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()
            print("[+] Server process terminated.")

if __name__ == "__main__":
    main()
