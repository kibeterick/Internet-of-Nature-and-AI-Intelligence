#!/usr/bin/env python3
"""Copy App_BROKEN_BACKUP.tsx to App.tsx"""
import shutil

shutil.copy2('src/App_BROKEN_BACKUP.tsx', 'src/App.tsx')
print("File copied successfully!")
