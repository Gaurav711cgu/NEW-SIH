from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a large viewport to see the full UI
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        print("Navigating to http://localhost:5174/")
        page.goto('http://localhost:5174/')
        
        # Wait a bit for Vite to compile and Leaflet tiles to load
        time.sleep(5)
        
        screenshot_path = '/Users/gauravkumarnayak/.gemini/antigravity/brain/023d62f5-8a47-4655-bbf3-74cedf9c1a41/convectnow_map_view.png'
        page.screenshot(path=screenshot_path, full_page=False)
        print("Screenshot saved to", screenshot_path)
        browser.close()

if __name__ == '__main__':
    run()
