# 🤖 COMPLETE GENIE AI FIX GUIDE

## 🎯 Current Status

Your Gemini API key was leaked on GitHub and disabled by Google.

**You need to:**

1. Get a new API key
2. Update your `.env` file
3. Rebuild and redeploy

## ✅ STEP-BY-STEP FIX

### Step 1: Get New API Key (2 minutes)

1. **Open this link:** https://makersuite.google.com/app/apikey

2. **Click "Create API Key"**

3. **Select project:**
   - Choose "Create API key in new project" (recommended)
   - Or select an existing project

4. **Copy the key:**
   - The key will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Copy the entire key

### Step 2: Update API Key (1 minute)

**Option A: Use the automated script (Easiest)**

1. Double-click: `update_api_key.bat`
2. Paste your new API key when prompted
3. Press Enter
4. Choose "y" to build and deploy automatically

**Option B: Manual update**

1. Open `.env` file in your project
2. Find this line:
   ```
   VITE_GEMINI_API_KEY=AIzaSyCw3w2zGN35f3a-Rik9dyk6Q_22twL1lOU
   ```
3. Replace with your new key:
   ```
   VITE_GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```
4. Save the file

### Step 3: Build and Deploy (3-4 minutes)

**Run these commands:**

```bash
npm run build
firebase deploy --only hosting
```

**Or in one command:**

```bash
npm run build && firebase deploy --only hosting
```

### Step 4: Test Genie AI

1. Open: https://flutter-ai-playground-214d7.web.app
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Refresh page: `Ctrl+F5`
4. Click the Genie button (floating button, bottom right)
5. Ask: "What is the Internet of Nature?"
6. Genie should respond! 🎉

## 🔐 SECURE YOUR NEW KEY (Important!)

### Option 1: Add API Key Restrictions (Recommended)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your new API key
3. Click "Edit" (pencil icon)
4. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Click "Add an item"
   - Add: `flutter-ai-playground-214d7.web.app/*`
   - Add: `localhost:*` (for development)
5. Click "Save"

This prevents others from using your key even if they find it.

### Option 2: Use Backend Proxy (Most Secure)

For production, consider using Firebase Cloud Functions:

- API key stays server-side (never exposed)
- Frontend calls your function
- Function calls Gemini API
- More secure but requires more setup

## 📝 Quick Commands Reference

```bash
# Test API key
python test_gemini_api.py

# Update API key (automated)
update_api_key.bat

# Update API key (manual with Python)
python update_api_key_and_deploy.py YOUR_NEW_KEY

# Build only
npm run build

# Deploy only
firebase deploy --only hosting

# Build and deploy
npm run build && firebase deploy --only hosting

# Test locally first
npm run dev
```

## 🔍 Troubleshooting

### Issue: "API key invalid"

**Solution:**

- Make sure you copied the entire key
- Key should start with `AIzaSy`
- Get a fresh key from https://makersuite.google.com/app/apikey

### Issue: "Permission denied"

**Solution:**

- Enable "Generative Language API" in Google Cloud Console
- Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- Click "Enable"

### Issue: "Quota exceeded"

**Solution:**

- Wait for daily quota reset (midnight Pacific Time)
- Or upgrade to paid plan
- Or get a new API key

### Issue: Genie still not working after deployment

**Solution:**

1. Clear browser cache completely
2. Hard refresh: `Ctrl+Shift+F5`
3. Check browser console (F12) for errors
4. Verify build included the new key:
   - Check `dist/assets/index-*.js`
   - Search for your new key (first 10 characters)

## ⚠️ IMPORTANT SECURITY NOTES

### DO NOT:

- ❌ Commit `.env` to Git
- ❌ Push API keys to GitHub
- ❌ Share API keys publicly
- ❌ Use the same key everywhere

### DO:

- ✅ Keep `.env` in `.gitignore` (already done)
- ✅ Add API key restrictions
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/prod
- ✅ Monitor API usage

## 📊 Why Your Key Was Leaked

When you pushed code to GitHub, the API key was included. Google automatically scans GitHub for leaked API keys and disables them immediately to protect you from:

- Unauthorized usage
- Unexpected charges
- API abuse
- Security breaches

**This is a GOOD thing!** Google is protecting you.

## 🎉 After Fix

Once you complete all steps:

✅ Genie AI will work perfectly  
✅ Your new key will be secure  
✅ No more "not available" errors  
✅ Full AI functionality restored

## 📞 Quick Help

**Get new key:** https://makersuite.google.com/app/apikey  
**Manage keys:** https://console.cloud.google.com/apis/credentials  
**Enable API:** https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

## ⏱️ Total Time

- Get new key: 2 minutes
- Update .env: 1 minute
- Build & deploy: 3-4 minutes
- **Total: 6-7 minutes**

## 🚀 Ready to Fix?

**Easiest method:**

1. Get new key: https://makersuite.google.com/app/apikey
2. Double-click: `update_api_key.bat`
3. Paste key and press Enter
4. Choose "y" to deploy
5. Done!

**Manual method:**

1. Get new key: https://makersuite.google.com/app/apikey
2. Update `.env` file
3. Run: `npm run build && firebase deploy --only hosting`
4. Done!

---

**Your Genie AI will be working in 6-7 minutes!** 🤖🌿✨
