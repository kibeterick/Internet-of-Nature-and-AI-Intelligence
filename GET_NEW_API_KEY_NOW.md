# 🔑 GET NEW API KEY - YOUR KEY WAS LEAKED

## ❌ Problem

Your Gemini API key was leaked on GitHub and Google disabled it.

**Error:** "Your API key was reported as leaked"

## ✅ Solution (3 Steps - 5 Minutes)

### Step 1: Get New API Key

1. Open: **https://makersuite.google.com/app/apikey**
2. Click "Create API Key"
3. Copy the new key

### Step 2: Update .env File

1. Open `.env` in your project
2. Replace this line:
   ```
   VITE_GEMINI_API_KEY=AIzaSyCw3w2zGN35f3a-Rik9dyk6Q_22twL1lOU
   ```
   With:
   ```
   VITE_GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```
3. Save

### Step 3: Rebuild & Deploy

```bash
npm run build
firebase deploy --only hosting
```

## ✅ Done!

Genie AI will work after redeployment.

## 🔐 Keep New Key Safe

- Don't push `.env` to GitHub
- `.env` is already in `.gitignore` (good!)
- Add API key restrictions at: https://console.cloud.google.com/apis/credentials

---

**Get new key now:** https://makersuite.google.com/app/apikey

**Time:** 5 minutes total
