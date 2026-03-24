import requests
import json

print("=" * 70)
print("LISTING AVAILABLE GEMINI MODELS")
print("=" * 70)
print()

API_KEY = "AIzaSyCw3w2zGN35f3a-Rik9dyk6Q_22twL1lOU"

# List models endpoint
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

print("Fetching available models...")
print()

try:
    response = requests.get(url, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        
        if 'models' in data:
            print("=" * 70)
            print("✅ AVAILABLE MODELS:")
            print("=" * 70)
            print()
            
            for model in data['models']:
                name = model.get('name', 'Unknown')
                display_name = model.get('displayName', 'Unknown')
                description = model.get('description', 'No description')
                supported_methods = model.get('supportedGenerationMethods', [])
                
                print(f"Model: {name}")
                print(f"Display Name: {display_name}")
                print(f"Description: {description[:100]}...")
                print(f"Supported Methods: {', '.join(supported_methods)}")
                print("-" * 70)
                print()
        else:
            print("No models found in response")
            print(json.dumps(data, indent=2))
    
    elif response.status_code == 400:
        print("=" * 70)
        print("❌ API KEY ERROR")
        print("=" * 70)
        print()
        print(response.text)
        print()
        print("Your API key might be invalid or restricted.")
        print()
        print("Get a new key from: https://makersuite.google.com/app/apikey")
    
    elif response.status_code == 403:
        print("=" * 70)
        print("❌ PERMISSION DENIED")
        print("=" * 70)
        print()
        print(response.text)
        print()
        print("Solutions:")
        print("1. Enable 'Generative Language API' in Google Cloud Console")
        print("2. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com")
        print("3. Click 'Enable'")
    
    else:
        print(f"Error: HTTP {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Error: {str(e)}")

print()
print("=" * 70)
print("DONE")
print("=" * 70)
