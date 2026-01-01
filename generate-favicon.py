#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script om favicon.ico te genereren van icon-192.png
Vereist: pip install Pillow
"""

import sys
import os

# Force UTF-8 encoding voor Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from PIL import Image

    # Pad naar icon-192.png
    icon_path = "public/icons/icon-192.png"
    favicon_path = "public/favicon.ico"

    if not os.path.exists(icon_path):
        print(f"ERROR: {icon_path} niet gevonden")
        sys.exit(1)

    print(f"OK: {icon_path} gevonden")
    print("Genereren favicon.ico...")

    # Open het PNG bestand
    img = Image.open(icon_path)

    # Resize voor verschillende ICO sizes (16, 32, 48)
    sizes = [(16, 16), (32, 32), (48, 48)]
    
    # Maak ICO bestand met meerdere sizes
    img.save(favicon_path, format='ICO', sizes=sizes)
    
    file_size = os.path.getsize(favicon_path) / 1024
    print(f"OK: favicon.ico gegenereerd: {favicon_path}")
    print(f"   Grootte: {file_size:.2f} KB")
    
except ImportError:
    print("ERROR: Pillow niet geïnstalleerd")
    print("   Installeer met: pip install Pillow")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

