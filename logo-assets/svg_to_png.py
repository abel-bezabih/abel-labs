#!/usr/bin/env python3
"""Convert SVG to PNG"""
import sys
import os

try:
    from cairosvg import svg2png
    svg_path = os.path.join(os.path.dirname(__file__), 'abel-labs-logo.svg')
    png_path = os.path.join(os.path.dirname(__file__), 'abel-labs-logo.png')
    
    # Convert at 4x resolution for better quality
    svg2png(url=svg_path, write_to=png_path, output_width=880, output_height=240)
    print(f"✅ PNG created successfully: {png_path}")
except ImportError:
    print("❌ cairosvg not installed. Installing...")
    print("Run: pip3 install cairosvg")
    print("\nOr use one of these methods:")
    print("1. Open abel-labs-logo.svg in Preview (Mac) → File → Export → PNG")
    print("2. Use online converter: https://convertio.co/svg-png/")
    print("3. Open render-logo.html in browser and take screenshot")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nAlternative methods:")
    print("1. Open abel-labs-logo.svg in Preview (Mac) → File → Export → PNG")
    print("2. Use online converter: https://convertio.co/svg-png/")
    sys.exit(1)












