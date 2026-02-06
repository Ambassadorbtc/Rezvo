#!/usr/bin/env python3
"""Capture the complete booking flow for Rezvo showcase"""
import asyncio
from playwright.async_api import async_playwright

BASE_URL = "https://easysched-3.preview.emergentagent.com"
OUTPUT_DIR = "/app/frontend/public/showcase"
BUSINESS_ID = "showcase-test-business"

async def capture_booking_flow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Navigate to booking page
        await page.goto(f"{BASE_URL}/book/{BUSINESS_ID}", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)
        
        # Close cookie modal if present
        try:
            accept_btn = page.locator("button:has-text('Accept All')")
            if await accept_btn.count() > 0:
                await accept_btn.first.click(force=True)
                await asyncio.sleep(0.5)
        except:
            pass
        
        # Step 1: Service selection
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_01_services.png")
        print("✓ Step 1: Service selection")
        
        # Select service
        service = page.locator("text=Haircut & Style").first
        await service.click(force=True)
        await asyncio.sleep(1)
        
        # Step 2: Service selected
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_02_service_selected.png")
        print("✓ Step 2: Service selected")
        
        # Click Select Time
        select_btn = page.locator("button:has-text('Select Time')")
        await select_btn.first.click(force=True)
        await asyncio.sleep(2)
        
        # Step 3: Calendar view
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_03_calendar.png")
        print("✓ Step 3: Calendar view")
        
        # Select date (10th)
        date = page.locator("button:has-text('10')").first
        await date.click(force=True)
        await asyncio.sleep(1.5)
        
        # Step 4: Time slots
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_04_time_slots.png")
        print("✓ Step 4: Time slots")
        
        # Select time
        time_slot = page.locator("button:has-text('10:00 AM')")
        await time_slot.first.click(force=True)
        await asyncio.sleep(0.5)
        
        # Step 5: Time selected
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_05_time_selected.png")
        print("✓ Step 5: Time selected")
        
        # Click Continue
        continue_btn = page.locator("button:has-text('Continue')")
        await continue_btn.first.click(force=True)
        await asyncio.sleep(1.5)
        
        # Step 6: Details form
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_06_details_form.png")
        print("✓ Step 6: Details form")
        
        # Fill form
        await page.fill('input[placeholder*="name"]', 'Jane Smith')
        await page.fill('input[placeholder*="Email"]', 'jane.smith@example.com')
        await page.fill('input[placeholder*="Phone"]', '+44 7700 900123')
        await asyncio.sleep(0.5)
        
        # Step 7: Form filled
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_07_form_filled.png")
        print("✓ Step 7: Form filled")
        
        # Click Book Now
        book_btn = page.locator("button:has-text('Book Now')")
        await book_btn.first.click(force=True)
        await asyncio.sleep(3)
        
        # Step 8: Confirmation
        await page.screenshot(path=f"{OUTPUT_DIR}/booking_flow_08_confirmation.png")
        print("✓ Step 8: Confirmation")
        
        # Also capture mobile business type
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.goto(f"{BASE_URL}/signup", wait_until="networkidle")
        await asyncio.sleep(2)
        
        # Close cookie if present
        try:
            accept_btn = page.locator("button:has-text('Accept All')")
            if await accept_btn.count() > 0:
                await accept_btn.first.click(force=True)
        except:
            pass
        
        await page.screenshot(path=f"{OUTPUT_DIR}/mobile_business_type.png")
        print("✓ Mobile signup page")
        
        await browser.close()
        print("\n=== All screenshots captured! ===\n")

if __name__ == "__main__":
    asyncio.run(capture_booking_flow())
