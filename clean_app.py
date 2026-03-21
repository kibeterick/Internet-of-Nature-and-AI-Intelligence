#!/usr/bin/env python3
"""Clean the App_BROKEN_BACKUP.tsx file by removing orphaned code after line 10797"""

# Read the file
with open('src/App_BROKEN_BACKUP.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only lines up to and including line 10797 (index 10796)
# Line 10797 is the closing brace of the first AppContent function
cleaned_lines = lines[:10797]

# Write the cleaned file
with open('src/App_BROKEN_BACKUP.tsx', 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print(f"File cleaned! Kept {len(cleaned_lines)} lines, removed {len(lines) - len(cleaned_lines)} lines.")
