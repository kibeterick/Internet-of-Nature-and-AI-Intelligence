# Test & Run Guide - After Critical Fixes

## Quick Start (3 Steps)

### Step 1: Clear Browser Cache

```
Press: Ctrl + Shift + Delete
Select: All time
Check: Cookies and other site data, Cached images and files
Click: Clear data
```

### Step 2: Hard Refresh

```
Press: Ctrl + Shift + R (or Cmd + Shift + R on Mac)
Wait for page to fully load
```

### Step 3: Test the App

## What to Test

### 1. Authentication

- [ ] Click "Sign In" button
- [ ] Verify Google sign-in button appears
- [ ] Verify GitHub sign-in button appears
- [ ] Verify Email/Password form appears
- [ ] Try signing in with Google
- [ ] Try signing in with GitHub
- [ ] Try signing in with Email

### 2. AI Features (Genie Chat)

- [ ] Click the Genie button (bottom right)
- [ ] Type a question like "What is the Internet of Nature?"
- [ ] Verify AI responds
- [ ] Test voice toggle (headphones icon)

### 3. Dark Mode

- [ ] Look for sun/moon icon in top right
- [ ] Click to toggle dark mode
- [ ] Verify page switches between light and dark themes

### 4. General UI

- [ ] Page loads without disappearing
- [ ] All navigation works
- [ ] No console errors (F12 to check)

## If Issues Persist

### Page Still Disappearing?

1. Open browser console: `F12`
2. Look for red error messages
3. Screenshot the error
4. Check if it's related to:
   - Firebase configuration
   - API key issues
   - Component loading errors

### Google Sign-In Not Showing?

1. Check Firebase Console → Authentication → Settings
2. Verify `localhost:5173` is in Authorized domains
3. Check browser console for CORS errors
4. Verify pop-ups are allowed for localhost

### AI Chat Not Working?

1. Check `.env` file has `VITE_GEMINI_API_KEY`
2. Verify API key is valid at https://makersuite.google.com/app/apikey
3. Check browser console for API errors
4. Try the "Test Connection" button in Genie chat

## Running the Project

### Terminal 1 - Backend Server

```bash
npm run server
# Should show: Server running on http://localhost:3000
```

### Terminal 2 - Frontend Dev Server

```bash
npm run dev
# Should show: Local: http://localhost:5173
```

### Access the App

Open browser and go to: `http://localhost:5173`

## Troubleshooting Commands

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Build for production (to test build)
npm run build

# Run tests
npm run test
```

## Success Indicators

✅ Page loads and stays loaded
✅ No console errors
✅ Google sign-in button visible
✅ Genie chat responds to messages
✅ Dark mode toggle works
✅ All navigation functional

## Next Steps After Testing

1. Push to GitHub (if tests pass)
2. Deploy to production
3. Monitor for any runtime errors
4. Gather user feedback

---

**Last Updated**: After critical fixes applied
**Status**: Ready for testing
