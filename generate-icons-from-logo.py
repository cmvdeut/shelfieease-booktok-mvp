#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate all app icons from ShelfieEase_Logo.png
"""

import sys
import os

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from PIL import Image

    # Paths
    logo_path = "public/ShelfieEase_Logo.png"
    public_path = "public"

    if not os.path.exists(logo_path):
        print(f"ERROR: {logo_path} niet gevonden")
        sys.exit(1)

    print(f"OK: {logo_path} gevonden")
    print("Genereren iconen...")

    # Open logo
    logo = Image.open(logo_path)
    
    # Convert to RGBA if needed (for transparency)
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    print(f"Logo grootte: {logo.width}x{logo.height}")

    # Generate favicon.ico (multiple sizes: 16, 32, 48)
    print("\nGenereren favicon.ico...")
    sizes = [(16, 16), (32, 32), (48, 48)]
    logo.save(f"{public_path}/favicon.ico", format='ICO', sizes=sizes)
    print(f"OK: favicon.ico gegenereerd")

    # Generate favicon-96x96.png
    print("\nGenereren favicon-96x96.png...")
    favicon_96 = logo.resize((96, 96), Image.Resampling.LANCZOS)
    favicon_96.save(f"{public_path}/favicon-96x96.png", format='PNG')
    print(f"OK: favicon-96x96.png gegenereerd")

    # Generate web-app-manifest-192x192.png
    print("\nGenereren web-app-manifest-192x192.png...")
    icon_192 = logo.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(f"{public_path}/web-app-manifest-192x192.png", format='PNG')
    print(f"OK: web-app-manifest-192x192.png gegenereerd")

    # Generate web-app-manifest-512x512.png
    print("\nGenereren web-app-manifest-512x512.png...")
    icon_512 = logo.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(f"{public_path}/web-app-manifest-512x512.png", format='PNG')
    print(f"OK: web-app-manifest-512x512.png gegenereerd")

    # Generate apple-touch-icon.png (180x180)
    print("\nGenereren apple-touch-icon.png...")
    apple_icon = logo.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save(f"{public_path}/apple-touch-icon.png", format='PNG')
    print(f"OK: apple-touch-icon.png gegenereerd")

    # Generate favicon.svg (if logo is simple, otherwise keep existing or skip)
    print("\nNote: favicon.svg wordt niet automatisch gegenereerd")
    print("     (behoud bestaande of genereer handmatig)")

    print("\n" + "="*50)
    print("OK: Alle iconen zijn gegenereerd!")
    print("="*50)
    
except ImportError:
    print("ERROR: Pillow niet geïnstalleerd")
    print("   Installeer met: pip install Pillow")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

