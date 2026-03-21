#!/usr/bin/env python3
"""Restore App.tsx from Git version"""
import shutil

# Copy the Git version to App.tsx
shutil.copy2('src/App_FROM_GIT.tsx', 'src/App.tsx')
print("✅ Restored App.tsx from Git version!")
print("File size:", os.path.getsize('src/App.tsx'), "bytes")
