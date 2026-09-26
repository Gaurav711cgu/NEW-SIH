import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 16:9 ratio, dark mode
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800},
            color_scheme='dark'
        )
        page = await context.new_page()
        print("Navigating to frontend...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        
        # Give it a second to load map and data
        await page.wait_for_timeout(3000)
        
        print("Taking full screenshot...")
        await page.screenshot(path="convectnow_vcr_ui.png", full_page=False)
        
        # Also clip just the bottom scrubber UI if possible
        try:
            # We look for the scrubber by matching the class 'card-blizzard' that contains 'VCR Controls'
            # But earlier we patched it with: className="h-20 card-blizzard ...
            scrubber = await page.query_selector('.h-20.card-blizzard')
            if scrubber:
                await scrubber.screenshot(path="convectnow_vcr_scrubber_only.png")
                print("Captured isolated scrubber!")
        except Exception as e:
            print(f"Could not capture isolated scrubber: {e}")

        await browser.close()
        print("Done.")

asyncio.run(main())
