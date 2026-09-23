#!/usr/bin/env python3
"""
Automated Visual Verification Harness for AntarcticScene 3D Simulation.
Spins up Vite dev server (if not active), launches Playwright Chromium with WebGL,
waits through boot sequence, initiates dive, and captures multi-depth screenshots.
"""

import os
import sys
import time
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

WORKSPACE_ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(WORKSPACE_ROOT, "frontend")
OUTPUT_DIR = os.path.join(WORKSPACE_ROOT, "screenshots")
URL = "http://127.0.0.1:5173/simulation"

def ensure_server():
    try:
        urllib.request.urlopen("http://127.0.0.1:5173", timeout=1)
        print("[HARNESS] Dev server is already running on port 5173.")
        return None
    except Exception:
        print("[HARNESS] Starting Vite dev server on port 5173...")
        proc = subprocess.Popen(
            ["npx", "vite", "--host", "127.0.0.1", "--port", "5173"],
            cwd=FRONTEND_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        for _ in range(30):
            try:
                urllib.request.urlopen("http://127.0.0.1:5173", timeout=1)
                print("[HARNESS] Dev server is ready.")
                return proc
            except Exception:
                time.sleep(0.5)
        print("[ERROR] Dev server failed to start.")
        sys.exit(1)

def pump_frames(page, seconds):
    t_end = time.time() + seconds
    while time.time() < t_end:
        page.evaluate("() => new Promise(r => requestAnimationFrame(r))")

def capture_mission():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    server_proc = ensure_server()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--enable-webgl",
                    "--ignore-gpu-blocklist",
                    "--use-gl=angle",
                    "--use-angle=metal",
                    "--disable-background-timer-throttling",
                    "--disable-renderer-backgrounding",
                    "--disable-backgrounding-occluded-windows",
                ]
            )
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()

            console_logs = []
            def on_console(msg):
                log_entry = f"[{msg.type.upper()}] {msg.text}"
                console_logs.append(log_entry)
                print(f"[BROWSER CONSOLE] {log_entry}")

            def on_error(err):
                err_entry = f"[PAGE ERROR] {err}"
                console_logs.append(err_entry)
                print(f"[BROWSER ERROR] {err_entry}")

            page.on("console", on_console)
            page.on("pageerror", on_error)

            print(f"[HARNESS] Navigating to {URL}...")
            page.goto(URL, wait_until="networkidle")

            print("[HARNESS] Waiting for boot sequence (~4s)...")
            page.wait_for_selector('button:has-text("INITIATE DIVE SEQUENCE")', timeout=20000)
            pump_frames(page, 2.0)  # Shader compilation & physics stabilization

            # Phase 1: Surface
            surface_path = os.path.join(OUTPUT_DIR, "01_surface_idle.png")
            page.screenshot(path=surface_path)
            print(f"[HARNESS] Captured Surface phase: {surface_path}")

            # Click Initiate Dive
            dive_btn = page.query_selector('button:has-text("INITIATE DIVE SEQUENCE")')
            if dive_btn:
                dive_btn.click()
                print("[HARNESS] Triggered INITIATE DIVE SEQUENCE.")

            # Phase 2: Descent / Midwater (~12s in)
            print("[HARNESS] Gliding through descent/midwater (~12s)...")
            pump_frames(page, 12.0)
            descent_path = os.path.join(OUTPUT_DIR, "02_midwater_descent.png")
            page.screenshot(path=descent_path)
            print(f"[HARNESS] Captured Descent phase: {descent_path}")

            # Phase 3: Seafloor (~16s further in)
            print("[HARNESS] Descending to abyssal seafloor (~16s)...")
            pump_frames(page, 16.0)
            seafloor_path = os.path.join(OUTPUT_DIR, "03_abyssal_seafloor.png")
            page.screenshot(path=seafloor_path)
            print(f"[HARNESS] Captured Seafloor phase: {seafloor_path}")

            # Phase 4: Sonar Sweep (~8s further in)
            print("[HARNESS] Engaging sonar sector mapping (~8s)...")
            pump_frames(page, 8.0)
            sonar_path = os.path.join(OUTPUT_DIR, "04_sonar_mapping.png")
            page.screenshot(path=sonar_path)
            # Save console logs for audit inspection
            log_path = os.path.join(OUTPUT_DIR, "console_logs.txt")
            with open(log_path, "w") as f:
                f.write("\n".join(console_logs))
            print(f"[HARNESS] Saved {len(console_logs)} console log lines to {log_path}")

            browser.close()
            print("[HARNESS] All screenshot captures complete.")
    finally:
        if server_proc:
            print("[HARNESS] Terminating background dev server...")
            server_proc.terminate()
            server_proc.wait()

if __name__ == "__main__":
    capture_mission()
