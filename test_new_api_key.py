import os
import requests
import json

# Read the API key from .env file
api_key = None
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('VITE_GEMINI_API_KEY='):
            api_key = line.split('=')[1].strip()
            break

if not api_key:
    print("❌ No API key found in .env file")
    exit(1)

print(f"✓ Found API key: {api_key[:20]}...")

# Test the API key with a simple request
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_ke