#!/usr/bin/env python3
"""Capture all screenshots for Rezvo showcase"""
import asyncio
from playwright.async_api import async_playwright

BASE_URL = "https://rezvo-scheduler.preview.emergentagent.com"
OUTPUT_DIR = "/app/frontend/public/showcase"

# Web pages to capture (desktop 1920x1080)
WEB_PAGES = [
    # Public pages
    ("landing", "/", "Landing Page"),
    ("login", "/login", "Login Page"),
    ("signup_main", "/signup", "Signup - Choose Method"),
    ("forgot_password", "/forgot-password", "Forgot Password"),
    ("terms", "/terms", "Terms of Service"),
    ("privacy", "/privacy", "Privacy Policy"),
    ("cookies", "/cookies", "Cookie Policy"),
]

# Mobile responsive pages (390x844)
MOBILE_PAGES = [
    ("mobile_landing", "/", "Mobile Landing"),
    ("mobile_login", "/login", "Mobile Login"),
    ("mobile_signup", "/signup", "Mobile Signup"),
    ("mobile_forgot_password", "/forgot-password", "Mobile Forgot Password"),
]

async def capture_page(page, name, url, desc, viewport_width=1920, viewport_height=1080):
    """Capture a single page"""
    try:
        await page.set_viewport_size({"width": viewport_width, "height": viewport_height})
        await page.goto(f"{BASE_URL}{url}", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(1)  # Wait for any animations
        
        # Close any cookie modals
        try:
            close_btn = page.locator("button:has-text('Accept All')")
            if await close_btn.count() > 0:
                await close_btn.first.click(force=True)
                await asyncio.sleep(0.5)
        except:
            pass
        
        filepath = f"{OUTPUT_DIR}/{name}.png"
        await page.screenshot(path=filepath, full_page=False)
        print(f"✓ {desc}: {filepath}")
        return True
    except Exception as e:
        print(f"✗ {desc}: {str(e)[:100]}")
        return False

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        print("\n=== Capturing Web Pages (Desktop) ===\n")
        for name, url, desc in WEB_PAGES:
            await capture_page(page, f"showcase_{name}", url, desc)
        
        print("\n=== Capturing Web Pages (Mobile Responsive) ===\n")
        for name, url, desc in MOBILE_PAGES:
            await capture_page(page, f"showcase_{name}", url, desc, 390, 844)
        
        # Capture signup flow step by step
        print("\n=== Capturing Signup Flow ===\n")
        
        # Step 1: Main signup page
        await capture_page(page, "flow_01_signup_main", "/signup", "Signup Step 1: Choose Method")
        
        # Step 2: Click email and capture form
        try:
            await page.goto(f"{BASE_URL}/signup", wait_until="networkidle")
            await page.click('[data-testid="email-signup-btn"]', force=True)
            await asyncio.sleep(1)
            await page.screenshot(path=f"{OUTPUT_DIR}/flow_02_signup_email.png")
            print("✓ Signup Step 2: Email Form")
        except Exception as e:
            print(f"✗ Signup Step 2: {str(e)[:50]}")
        
        await browser.close()
        print("\n=== Screenshot capture complete! ===\n")

if __name__ == "__main__":
    asyncio.run(main())
