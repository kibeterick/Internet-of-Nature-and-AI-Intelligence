#!/usr/bin/env python3
"""Fix all chart components by removing activeTab prop"""
import re

print("🔧 Fixing all chart components...")

# Read the file
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# List of components to fix
components = [
    'PredictionDashboard',
    'IndustrialESGChart', 
    'CarbonForecast',
    'PredictiveAnalytics',
    'LiveDataStream',
    'PollinatorActivity'
]

for component in components:
    # Fix component definition - remove activeTab parameter
    pattern1 = f'const {component} = \\(\\{{.*?activeTab.*?\\}}.*?\\) =>'
    replacement1 = f'const {component} = () =>'
    content = re.sub(pattern1, replacement1, content)
    
    # Fix component usage - remove activeTab prop
    pattern2 = f'<{component}\\s+activeTab={{activeTab}}\\s*/>'
    replacement2 = f'<{component} />'
    content = re.sub(pattern2, replacement2, content)
    
    print(f"  ✓ Fixed {component}")

# Write back
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ All chart components fixed!")
print("\nChanges:")
print("- Removed activeTab prop from component definitions")
print("- Removed activeTab prop from component usages")
print("\nThis prevents infinite re-renders in recharts.")
