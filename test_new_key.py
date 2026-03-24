import requests
import json

# Test the new Gemini API key
api_key = "AIzaSyDvFAf1OaA5G3-hbBtjEVBEX7Z7SZT41NY"

# Test with gemini-pro model
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"

headers = {
    "Content-Type": "application/json"
}

data = {
    "contents": [{
        "parts": [{
            "text": "Say hello"
        }]
    }]
}

print("Testing new Gemini API key...")
print(f"API Key: {api_key}")
print(f"URL: {url}")
print()

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
