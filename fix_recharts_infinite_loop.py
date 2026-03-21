#!/usr/bin/env python3
"""Fix all ResponsiveContainer components causing infinite loops"""
import re

print("🔧 Fixing recharts infinite loop issues...")

# Read the file
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: Remove key={activeTab} from ResponsiveContainer
# This pattern matches ResponsiveContainer with key prop
pattern1 = r'(<ResponsiveContainer[^>]*)\s+key=\{activeTab\}'
content = re.sub(pattern1, r'\1', content)

# Pattern 2: Remove debounce prop from ResponsiveContainer
pattern2 = r'(<ResponsiveContainer[^>]*)\s+debounce=\{\d+\}'
content = re.sub(pattern2, r'\1', content)

# Pattern 3: Clean up any double spaces left behind
content = re.sub(r'  +', ' ', content)

# Write back
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all ResponsiveContainer infinite loop issues!")
print("\nChanges made:")
print("- Removed all key={activeTab} props from ResponsiveContainer")
print("- Removed all debounce props from ResponsiveContainer")
print("\nThese props cause infinite re-renders in recharts components.")
