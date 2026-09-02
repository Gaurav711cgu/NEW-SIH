from playwright.sync_api import sync_playwright
import time

artifact_dir = "/Users/gauravkumarnayak/.gemini/antigravity/brain/023d62f5-8a47-4655-bbf3-74cedf9c1a41"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    
    routes = [
        ("ocean-state", "ocean_state.png"),
        ("auv-twin", "auv_twin.png"),
        ("seafloor", "seafloor.png"),
        ("validation", "validation.png")
    ]
    
    for route, filename in routes:
        print(f"Capturing {route}...")
        page.goto(f"http://localhost:5173/{route}")
        page.wait_for_load_state("networkidle")
        time.sleep(3) # wait for 3D/animations to render
        page.screenshot(path=f"{artifact_dir}/{filename}")
    
    browser.close()
print("Done!")
