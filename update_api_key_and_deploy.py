import os
import sys

print("=" * 70)
print("UPDATE GEMINI API KEY AND DEPLOY")
print("=" * 70)
print()

# Check if API key was provided as argument
if len(sys.argv) > 1:
    new_api_key = sys.argv[1]
else:
    print("Enter your NEW Gemini API key:")
    print("(Get it from: https://makersuite.google.com/app/apikey)")
    print()
    new_api_key = input("New API Key: ").strip()

if not new_api_key:
    print()
    print("❌ No API key provided!")
    print()
    print("Please run again with your new API key.")
    sys.exit(1)

if not new_api_key.startswith("AIzaSy"):
    print()
    print("⚠️ Warning: API key doesn't start with 'AIzaSy'")
    print("Are you sure this is correct?")
    response = input("Continue anyway? (y/n): ").strip().lower()
    if response != 'y':
        print("Cancelled.")
        sys.exit(1)

print()
print("=" * 70)
print("STEP 1: UPDATING .env FILE")
print("=" * 70)
print()

# Read current .env file
try:
    with open('.env', 'r') as f:
        env_content = f.read()
    
    # Replace the API key
    lines = env_content.split('\n')
    updated = False
    new_lines = []
    
    for line in lines:
        if line.startswith('VITE_GEMINI_API_KEY='):
            new_lines.append(f'VITE_GEMINI_API_KEY={new_api_key}')
            updated = True
            print(f"✓ Updated VITE_GEMINI_API_KEY")
        elif line.startswith('GEMINI_API_KEY=') and not line.startswith('VITE_'):
            new_lines.append(f'GEMINI_API_KEY={new_api_key}')
            print(f"✓ Updated GEMINI_API_KEY")
        else:
            new_lines.append(line)
    
    # Write back to .env
    with open('.env', 'w') as f:
        f.write('\n'.join(new_lines))
    
    if updated:
        print()
        print("✅ .env file updated successfully!")
    else:
        print()
        print("⚠️ VITE_GEMINI_API_KEY not found in .env")
        print("Adding it now...")
        with open('.env', 'a') as f:
            f.write(f'\nVITE_GEMINI_API_KEY={new_api_key}\n')
        print("✅ Added VITE_GEMINI_API_KEY to .env")

except FileNotFoundError:
    print("❌ .env file not found!")
    print("Creating new .env file...")
    with open('.env', 'w') as f:
        f.write(f'VITE_GEMINI_API_KEY={new_api_key}\n')
        f.write(f'GEMINI_API_KEY={new_api_key}\n')
    print("✅ Created .env file with new API key")

except Exception as e:
    print(f"❌ Error updating .env: {e}")
    sys.exit(1)

print()
print("=" * 70)
print("STEP 2: TESTING API KEY")
print("=" * 70)
print()

# Test the API key
import requests

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={new_api_key}"
payload = {
    "contents": [{
        "parts": [{
            "text": "Say 'Hello! I am working!' in one sentence."
        }]
    }]
}

print("Testing new API key...")
try:
    response = requests.post(url, json=payload, timeout=10)
    
    if response.status_code == 200:
        print("✅ API KEY IS WORKING!")
        print()
        data = response.json()
        if 'candidates' in data:
            text = data['candidates'][0]['content']['parts'][0]['text']
            print(f"Response: {text}")
    elif response.status_code == 403:
        print("❌ API KEY IS INVALID OR RESTRICTED")
        print()
        print("Error:", response.json().get('error', {}).get('message', 'Unknown error'))
        print()
        print("Please get a new key from: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    else:
        print(f"⚠️ Unexpected response: HTTP {response.status_code}")
        print(response.text)
        print()
        print("Continuing anyway...")

except Exception as e:
    print(f"⚠️ Could not test API key: {e}")
    print("Continuing anyway...")

print()
print("=" * 70)
print("STEP 3: READY TO BUILD AND DEPLOY")
print("=" * 70)
print()

print("Your API key has been updated!")
print()
print("Next steps:")
print()
print("1. Build your app:")
print("   npm run build")
print()
print("2. Deploy to Firebase:")
print("   firebase deploy --only hosting")
print()
print("Or run both in one command:")
print("   npm run build && firebase deploy --only hosting")
print()
print("=" * 70)
print("WOULD YOU LIKE TO BUILD AND DEPLOY NOW?")
print("=" * 70)
print()

response = input("Build and deploy now? (y/n): ").strip().lower()

if response == 'y':
    print()
    print("=" * 70)
    print("BUILDING AND DEPLOYING...")
    print("=" * 70)
    print()
    
    # Build
    print("[1/2] Building app...")
    print()
    build_result = os.system("npm run build")
    
    if build_result != 0:
        print()
        print("❌ Build failed!")
        print("Please check the errors above and try again.")
        sys.exit(1)
    
    print()
    print("✅ Build successful!")
    print()
    
    # Deploy
    print("[2/2] Deploying to Firebase...")
    print()
    deploy_result = os.system("firebase deploy --only hosting")
    
    if deploy_result != 0:
        print()
        print("❌ Deployment failed!")
        print("Please check the errors above and try again.")
        sys.exit(1)
    
    print()
    print("=" * 70)
    print("✅ SUCCESS! GENIE AI IS NOW WORKING!")
    print("=" * 70)
    print()
    print("Your app is live at:")
    print("https://flutter-ai-playground-214d7.web.app")
    print()
    print("To test Genie AI:")
    print("1. Open the URL above")
    print("2. Clear browser cache (Ctrl+Shift+Delete)")
    print("3. Refresh (Ctrl+F5)")
    print("4. Click the Genie button (bottom right)")
    print("5. Ask a question!")
    print()
else:
    print()
    print("Skipped build and deploy.")
    print()
    print("When you're ready, run:")
    print("  npm run build && firebase deploy --only hosting")
    print()

print("=" * 70)
print("DONE!")
print("=" * 70)
