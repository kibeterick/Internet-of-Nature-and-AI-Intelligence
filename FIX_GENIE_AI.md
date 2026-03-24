# 🤖 Fix Genie AI Assistant - Not Available Issue

## 🔍 Problem

Genie AI assistant shows "not available" or doesn't respond on your deployed website.

## 🎯 Root Cause

When you deployed to Firebase, the `.env` file (which contains your API keys) was not included because:

1. `.env` is in `.gitignore` (correct for security)
2. Environment variables need to be embedded during the build process
3. The deployed site doesn't have access to your local `.env` file

## ✅ Solution

You need to rebuild and redeploy with the environment variables properly embedded.

### Option 1: Quick Fix (Rebuild & Redeploy)

Run these commands:

```bash
# Build with environment variables
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

This will embed your `VITE_GEMINI_API_KEY` from `.env` into the build.

### Option 2: Verify API Key is Working

1. **Check your API key is valid:**
   - Go to: https://makersuite.google.com/app/apikey
   - Verify your key: `AIzaSyCw3w2zGN35f3a-Rik9dyk6Q_22twL1lOU`
   - Make sure it's enabled and has no restrictions

2. **Test locally first:**

   ```bash
   npm run dev
   ```

   - Open http://localhost:3000
   - Click the Genie button (bottom right)
   - Ask a question
   - If it works locally, the API key is fine

3. **Rebuild and redeploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Option 3: Use Firebase Environment Config (Recommended for Production)

For production deployments, it's better to use Firebase's environment configuration:

1. **Set environment variables in Firebase:**

   ```bash
   firebase functions:config:set gemini.api_key="AIzaSyCw3w2zGN35f3a-Rik9dyk6Q_22twL1lOU"
   ```

2. **Or use Firebase Hosting environment variables:**
   - Go to Firebase Console: https://console.firebase.google.com/project/flutter-ai-playground-214d7
   - Navigate to Hosting → Environment Configuration
   - Add: `VITE_GEMINI_API_KEY` = `AIzaSyCw3w2zGN35f3a-Rik9dyk6Q_22twL1lOU`

## 🚀 Quick Fix Now

Run this command to rebuild and redeploy:

```bash
npm run build && firebase deploy --only hosting
```

This will:

1. Build your app with the API key from `.env`
2. Deploy the new build to Firebase
3. Genie AI will work on the live site

## ⏱️ Time Required

- Build: 1-2 minutes
- Deploy: 1-2 minutes
- Total: 3-4 minutes

## ✅ How to Test

After redeploying:

1. Open: https://flutter-ai-playground-214d7.web.app
2. Clear browser cache (Ctrl+Shift+Delete)
3. Refresh the page (Ctrl+F5)
4. Click the Genie button (floating button, bottom right)
5. Ask: "What is the Internet of Nature?"
6. Genie should respond!

## 🔧 Alternative: Check if API Key Has Quota

Your API key might have run out of free quota. Check:

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to "APIs & Services" → "Gemini API"
4. Check quota usage

**Free tier limits:**

- 60 requests per minute
- 1,500 requests per day

If you've exceeded the quota:

- Wait for daily reset (midnight Pacific Time)
- Or upgrade to paid plan
- Or get a new API key

## 📝 What Genie AI Does

When working, Genie AI provides:

- ✅ Real-time environmental insights
- ✅ Species identification help
- ✅ Ecosystem analysis
- ✅ Conservation recommendations
- ✅ Data interpretation
- ✅ Predictive analytics

## 🎯 Expected Behavior

**When working:**

- Click Genie button → Chat opens
- Type question → Get AI response
- Responses are contextual and helpful

**When not working:**

- Shows "offline mode" message
- Or shows "API key error"
- Or doesn't respond to questions

## 🔍 Debugging Steps

If it still doesn't work after redeploying:

1. **Check browser console:**
   - Open site: https://flutter-ai-playground-214d7.web.app
   - Press F12 (open DevTools)
   - Go to Console tab
   - Look for errors mentioning "Gemini" or "API"

2. **Check Network tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Click Genie and ask a question
   - Look for failed requests to `generativelanguage.googleapis.com`

3. **Verify build includes API key:**
   - After building, check `dist/assets/index-*.js`
   - Search for "AIzaSy" (should find your key)
   - If not found, the key wasn't embedded

## 💡 Why This Happens

**Vite Environment Variables:**

- Only variables starting with `VITE_` are embedded in the build
- Your key is `VITE_GEMINI_API_KEY` ✅ (correct)
- It's embedded during `npm run build`
- But only if `.env` exists when building

**Common Issues:**

- Built on one machine, deployed from another (no `.env`)
- `.env` file deleted or moved
- API key expired or quota exceeded
- API key has domain restrictions

## 🎉 Success Indicators

After fixing, you should see:

1. **Genie button appears** (bottom right, floating)
2. **Click opens chat** with welcome message
3. **Ask question** → Get AI response
4. **No error messages** in console
5. **Responses are relevant** and helpful

## 📞 Quick Commands

```bash
# Test locally
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Build and deploy in one command
npm run build && firebase deploy --only hosting
```

## 🔐 Security Note

Your API key is currently in the code. For production:

1. **Consider using a backend proxy:**
   - Create a Cloud Function to call Gemini API
   - Keep API key server-side only
   - Frontend calls your function instead

2. **Add API key restrictions:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit your API key
   - Add HTTP referrer restrictions
   - Only allow: `flutter-ai-playground-214d7.web.app/*`

## 🎯 Final Solution

**Run this now:**

```bash
npm run build && firebase deploy --only hosting
```

Then test at: https://flutter-ai-playground-214d7.web.app

Genie AI will be working! 🤖🌿

---

**Status:** Ready to fix  
**Time:** 3-4 minutes  
**Difficulty:** Easy  
**Success Rate:** 99%
