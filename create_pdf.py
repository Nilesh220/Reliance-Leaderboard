import os
from pathlib import Path
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from PIL import Image
import io

# Create screenshots directory if it doesn't exist
screenshots_dir = Path("screenshots")
screenshots_dir.mkdir(exist_ok=True)

# Initialize PDF
pdf_path = Path("Reliance_Leaderboard_Screenshots.pdf")
c = canvas.Canvas(str(pdf_path), pagesize=landscape(letter))
width, height = landscape(letter)

# Take screenshots and add them to PDF
from playwright.sync_api import sync_playwright

screenshots = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    
    # Screenshot 1: Leaderboard - Hero Section
    page1 = browser.new_page()
    page1.goto("file:///c:/Users/LENOVO/OneDrive/Desktop/Reliance%20Leaderboard/index.html")
    page1.evaluate("() => window.scrollTo(0, 0)")
    page1.wait_for_timeout(500)
    img1 = page1.screenshot()
    screenshots.append(("Leaderboard - Hero & Stats", img1))
    page1.close()
    
    # Screenshot 2: Leaderboard - Update Timer & City Standings
    page2 = browser.new_page()
    page2.goto("file:///c:/Users/LENOVO/OneDrive/Desktop/Reliance%20Leaderboard/index.html")
    page2.evaluate("() => window.scrollTo(0, 2000)")
    page2.wait_for_timeout(500)
    img2 = page2.screenshot()
    screenshots.append(("Leaderboard - Update Timer & City Standings", img2))
    page2.close()
    
    # Screenshot 3: Leaderboard - Top Performers
    page3 = browser.new_page()
    page3.goto("file:///c:/Users/LENOVO/OneDrive/Desktop/Reliance%20Leaderboard/index.html")
    page3.evaluate("() => window.scrollTo(0, 3500)")
    page3.wait_for_timeout(500)
    img3 = page3.screenshot()
    screenshots.append(("Leaderboard - Top Performers", img3))
    page3.close()
    
    # Screenshot 4: Leaderboard - Individual Rankings
    page4 = browser.new_page()
    page4.goto("file:///c:/Users/LENOVO/OneDrive/Desktop/Reliance%20Leaderboard/index.html")
    page4.evaluate("() => window.scrollTo(0, 2500)")
    page4.wait_for_timeout(500)
    img4 = page4.screenshot()
    screenshots.append(("Leaderboard - Individual Rankings", img4))
    page4.close()
    
    # Screenshot 5: Admin Portal - Login Screen
    page5 = browser.new_page()
    page5.goto("file:///c:/Users/LENOVO/OneDrive/Desktop/Reliance%20Leaderboard/admin.html")
    page5.wait_for_timeout(500)
    img5 = page5.screenshot()
    screenshots.append(("Admin Portal - Login", img5))
    page5.close()
    
    browser.close()

# Add screenshots to PDF
for i, (title, img_data) in enumerate(screenshots):
    # Convert screenshot bytes to PIL Image
    img = Image.open(io.BytesIO(img_data))
    
    # Calculate dimensions to fit on page
    img_width = img.width
    img_height = img.height
    
    # Scale to fit page
    max_width = width - 40
    max_height = height - 60
    
    scale = min(max_width / img_width, max_height / img_height)
    new_width = img_width * scale
    new_height = img_height * scale
    
    # Save temp image
    temp_path = screenshots_dir / f"screenshot_{i}.png"
    img.save(temp_path)
    
    # Add title
    c.setFont("Helvetica-Bold", 14)
    c.drawString(20, height - 30, title)
    
    # Add screenshot
    c.drawImage(str(temp_path), (width - new_width) / 2, (height - new_height) / 2 - 20, 
                width=new_width, height=new_height, preserveAspectRatio=True)
    
    # Add page number
    c.setFont("Helvetica", 10)
    c.drawString(width - 80, 20, f"Page {i + 1}")
    
    # New page for next screenshot (except the last one)
    if i < len(screenshots) - 1:
        c.showPage()

# Save PDF
c.save()
print(f"PDF created successfully: {pdf_path}")
print(f"Total pages: {len(screenshots)}")
