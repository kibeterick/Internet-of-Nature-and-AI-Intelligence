#!/usr/bin/env python3
"""Restore the system from Git to get the original working version"""
import subprocess
import sys

print("🔄 Restoring system from Git...")
print("=" * 60)

# Check if there are uncommitted changes
result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
if result.stdout.strip():
    print("⚠️  You have uncommitted changes. Stashing them...")
    subprocess.run(['git', 'stash'], check=False)

# Get the list of commits
print("\n📋 Recent commits:")
result = subprocess.run(['git', 'log', '--oneline', '-10'], capture_output=True, text=True)
print(result.stdout)

# Find a commit before the issues started
print("\n🔍 Looking for a working commit...")
result = subprocess.run(['git', 'log', '--all', '--oneline', '--grep=working\\|success\\|complete', '-5'], 
                       capture_output=True, text=True)

if result.stdout.strip():
    print("Found potential working commits:")
    print(result.stdout)
    
# Reset to the last known good state
print("\n🔄 Restoring App.tsx from Git history...")
subprocess.run(['git', 'checkout', 'HEAD~1', '--', 'src/App.tsx'], check=False)

print("\n✅ Restoration attempt complete!")
print("\nNext steps:")
print("1. Check if src/App.tsx is restored")
print("2. Run: npm run dev")
print("3. Test the application")
