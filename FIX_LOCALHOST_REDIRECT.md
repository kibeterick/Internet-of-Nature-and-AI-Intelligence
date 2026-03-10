# 🔧 Fix: Localhost Redirecting to Google Search

## Problem

When you type `http://localhost:5174` in the browser, it redirects to Google search instead of showing your app.

## Root Cause

Your browser is treating the localhost URL as a search query instead of a direct URL.

## Solutions

### Solution 1: Use Full URL Format (Recommended)

Make sure you're typing the FULL URL with `http://` at the beginning:

```
http://localhost:5174
```

NOT just:

```
localhost:5174
```

### Solution 2: Browser Address Bar Tips

1. **Click the address bar** (or press Ctrl+L)
2. **Clear any existing text**
3. **Type the full URL**: `http://localhost:5174`
4. **Press Enter**

### Solution 3: Disable Search Redirect

Some browsers redirect incomplete URLs to search. To fix:

**Chrome/Edge:**

1. Go to Settings
2. Search for "Search engine"
3. Make sure Google is set as default
4. But ensure you're typing full URLs with `http://`

**Firefox:**

1. Type `about:config` in address bar
2. Search for `keyword.enabled`
3. Set to `false` (optional)

### Solution 4: Use Bookmarks

1. Go to `http://localhost:5174`
2. Bookmark the page (Ctrl+D)
3. Click bookmark to access app in future

### Solution 5: Use Different Format

Try these alternative URLs:

```
http://127.0.0.1:5174
```

or

```
http://localhost:5174/
```

(with trailing slash)

## Step-by-Step Fix

### Step 1: Verify Server is Running

Open terminal and check:

```bash
npm run dev:all
```

You should see:

```
Server running on http://localhost:3000
VITE v6.4.1  ready in XXX ms
➜  Local:   http://localhost:5174/
```

### Step 2: Clear Browser Cache

```
Ctrl + Shift + Delete
Select: All time
Check: Cookies and cached files
Click: Clear data
```

### Step 3: Access the App

1. **Click address bar**: Ctrl+L
2. **Type full URL**: `http://localhost:5174`
3. **Press Enter**
4. **Wait 5-10 seconds** for app to load

### Step 4: Verify App Loads

You should see:

- ✅ Internet of Nature logo
- ✅ Navigation menu
- ✅ Sign in button
- ✅ Dashboard content

## Common Mistakes

### ❌ Wrong

```
localhost:5174
```

### ✅ Correct

```
http://localhost:5174
```

### ❌ Wrong

```
5174
```

### ✅ Correct

```
http://localhost:5174
```

### ❌ Wrong

```
localhost
```

### ✅ Correct

```
http://localhost:5174
```

## Browser-Specific Fixes

### Chrome

1. Make sure you're typing `http://` before localhost
2. If it still redirects, try incognito mode (Ctrl+Shift+N)
3. Try a different browser

### Firefox

1. Type `http://localhost:5174` in address bar
2. Press Enter
3. Should work directly

### Edge

1. Same as Chrome
2. Type full URL with `http://`
3. Press Enter

### Safari

1. Type `http://localhost:5174` in address bar
2. Press Enter
3. Should work

## If Still Not Working

### Check 1: Server Running?

```bash
npm run dev:all
```

Wait for:

```
VITE v6.4.1  ready in XXX ms
➜  Local:   http://localhost:5174/
```

### Check 2: Port Available?

```bash
netstat -ano | findstr :5174
```

If port is in use, restart:

```bash
npm run dev:all
```

### Check 3: Firewall?

Windows Firewall might block localhost:

1. Go to Windows Defender Firewall
2. Allow Node.js through firewall
3. Restart server

### Check 4: Try Different Port

Edit `vite.config.ts`:

```typescript
server: {
  port: 5175,  // Change to different port
}
```

Then access: `http://localhost:5175`

## Quick Reference

### Correct URL Format

```
http://localhost:5174
```

### Components

- `http://` - Protocol (required)
- `localhost` - Server name
- `:5174` - Port number
- `/` - Root path (optional)

### All Valid Formats

```
http://localhost:5174
http://localhost:5174/
http://127.0.0.1:5174
http://127.0.0.1:5174/
```

## Success Checklist

- [ ] Server running (`npm run dev:all`)
- [ ] Typed full URL with `http://`
- [ ] Cleared browser cache
- [ ] Hard refreshed (Ctrl+Shift+R)
- [ ] Waited 5-10 seconds for app to load
- [ ] See app content (not blank page)
- [ ] No Google search redirect

## Final Solution

If nothing works:

1. **Stop everything**: Ctrl+C in all terminals
2. **Clear cache**: Ctrl+Shift+Delete
3. **Restart server**: `npm run dev:all`
4. **Wait 10 seconds**
5. **Open new browser tab**
6. **Type**: `http://localhost:5174`
7. **Press Enter**
8. **Wait for app to load**

---

**Your app is running at: http://localhost:5174**

Just make sure to:

1. Type the FULL URL with `http://`
2. Press Enter
3. Wait for it to load
4. Enjoy!
