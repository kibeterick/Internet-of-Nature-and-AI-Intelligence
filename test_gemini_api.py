import requests
import json

print("=" * 70)
print("TESTING GEMINI API KEY")
print("=" * 70)
print()

# Your API key
API_KEY = "AIzaSyCw3w2zGN35f3a-Rik9dyk6Q_22twL1lOU"

print(f"API Key: {API_KEY[:20]}...{API_KEY[-10:]}")
print()

# Test endpoint
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"

# Test payload
payload = {
    "contents": [{
        "parts": [{
            "text": "Say 'Hello! I am Genie AI and I am working!' in one sentence."
        }]
    }]
}

print("Testing API connection...")
print()

try:
    response = requests.post(url, json=payload, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    print()
    
    if response.status_code == 200:
        data = response.json()
        if 'candidates' in data and len(data['candidates']) > 0:
            text = data['candidates'][0]['content']['parts'][0]['text']
            print("=" * 70)
            print("✅ SUCCESS! API KEY IS WORKING!")
            print("=" * 70)
            print()
            print("Response from Genie AI:")
            print(text)
            print()
            print("=" * 70)
            print("CONCLUSION: Your API key is valid and working!")
            print("=" * 70)
            print()
            print("Next steps:")
            print("1. Rebuild your app: npm run build")
            print("2. Deploy to Firebase: firebase deploy --only hosting")
            print("3. Genie AI will work on the live site!")
        else:
            print("⚠️ Unexpected response format")
            print(json.dumps(data, indent=2))
    
    elif response.status_code == 400:
        print("=" * 70)
        print("❌ API KEY ERROR - INVALID OR RESTRICTED")
        print("=" * 70)
        print()
        print("Error details:")
        print(response.text)
        print()
        print("Solutions:")
        print("1. Get a new API key from: https://makersuite.google.com/app/apikey")
        print("2. Make sure the API is enabled in Google Cloud Console")
        print("3. Check if there are any restrictions on the key")
    
    elif response.status_code == 403:
        print("=" * 70)
        print("❌ PERMISSION DENIED")
        print("=" * 70)
        print()
        print("Error details:")
        print(response.text)
        print()
        print("Solutions:")
        print("1. Enable 'Generative Language API' in Google Cloud Console")
        print("2. Check API key permissions")
        print("3. Verify billing is enabled (if required)")
    
    elif response.status_code == 429:
        print("=" * 70)
        print("❌ QUOTA EXCEEDED")
        print("=" * 70)
        print()
        print("You've exceeded your API quota.")
        print()
        print("Solutions:")
        print("1. Wait for quota reset (usually daily)")
        print("2. Upgrade your plan")
        print("3. Get a new API key")
    
    else:
        print("=" * 70)
        print(f"❌ ERROR: HTTP {response.status_code}")
        print("=" * 70)
        print()
        print("Response:")
        print(response.text)

except requests.exceptions.Timeout:
    print("=" * 70)
    print("❌ CONNECTION TIMEOUT")
    print("=" * 70)
    print()
    print("Check your internet connection and try again.")

except requests.exceptions.ConnectionError:
    print("=" * 70)
    print("❌ CONNECTION ERROR")
    print("=" * 70)
    print()
    print("Cannot connect to Google's API.")
    print("Check your internet connection.")

except Exception as e:
    print("=" * 70)
    print("❌ UNEXPECTED ERROR")
    print("=" * 70)
    print()
    print(f"Error: {str(e)}")

print()
print("=" * 70)
print("TEST COMPLETE")
print("=" * 70)
