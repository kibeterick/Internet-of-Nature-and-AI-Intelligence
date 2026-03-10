# 🚀 How to Access Your App

## The Issue

When you type `http://localhost:5174` in the browser, it's redirecting to Google search instead of showing your app.

## The Solution

### Option 1: Direct Access (Recommended)

Simply click this link or copy-paste into your browser:

```
http://localhost:5174
```

If that doesn't work, try:

```
http://127.0.0.1:5174
```

### Option 2: Check if Server is Running

Open a new terminal and run:

```bash
npm run dev:frontend
```

You should see:

```
VITE v6.4.1  ready in XXX ms
➜  Local:   http://localhost:5174/
```

### Option 3: Restart Everything

If still not working, stop and restart:

**Stop all servers:**

- Press Ctrl+C in all terminal windows

**Start fresh:**

```bash
npm run dev:all
```

This starts both backend and frontend together.

## What You Should See

When you access the app correctly, you should see:

- ✅ Internet of Nature logo
- ✅ Navigation menu
- ✅ Sign in button
- ✅ Dashboard content
- ✅ All features visible

## Troubleshooting

### If You Still See Google Search

1. **Clear browser cache**: Ctrl + Shift + Delete
2. **Hard refresh**: Ctrl + Shift + R
3. **Try incognito mode**: Ctrl + Shift + N
4. **Try different browser**: Chrome, Firefox, Edge

### If You See Blank Page

1. Open console: F12
2. Look for red errors
3. Check if server is running
4. Restart the server

### If You See "Cannot GET /"

1. Server is running but app not loaded
2. Wait 5-10 seconds for app to compile
3. Refresh page: F5
4. Hard refresh: Ctrl + Shift + R

## Server Ports

### Frontend

- **Port**: 5174 (or 5173 if available)
- **URL**: http://localhost:5174
- **Command**: `npm run dev:frontend`

### Backend

- **Port**: 3000
- **URL**: http://localhost:3000
- **Command**: `npm run dev`

## Quick Access

### Copy-Paste These URLs

**Frontend (Your App)**

```
http://localhost:5174
```

**Backend API**

```
http://localhost:3000
```

**Alternative Frontend**

```
http://127.0.0.1:5174
```

## Browser Tips

### Disable Search Redirect

If your browser is redirecting to Google:

1. Check address bar settings
2. Make sure you're typing the full URL
3. Don't press Enter on partial URLs
4. Use Ctrl+L to focus address bar

### Force Reload

- **Soft refresh**: F5
- **Hard refresh**: Ctrl + Shift + R
- **Clear cache & reload**: Ctrl + Shift + Delete, then F5

## Still Not Working?

### Check Server Status

Open terminal and run:

```bash
npm run dev:all
```

Wait for output:

```
Server running on http://localhost:3000
VITE v6.4.1  ready in XXX ms
➜  Local:   http://localhost:5174/
```

### Check Ports

Make sure ports 3000 and 5174 are not blocked:

```bash
netstat -ano | findstr :5174
netstat -ano | findstr :3000
```

### Restart Everything

1. Stop all terminals: Ctrl+C
2. Close all browser tabs
3. Start fresh: `npm run dev:all`
4. Wait 10 seconds
5. Open: http://localhost:5174

## Success Indicators

✅ Page loads (not blank)
✅ See app content
✅ No Google search redirect
✅ No console errors
✅ Can see buttons and features

## Final Steps

1. **Copy this URL**: `http://localhost:5174`
2. **Paste in browser address bar**
3. **Press Enter**
4. **Wait for page to load** (5-10 seconds)
5. **Enjoy your app!**

---

**If you still have issues:**

1. Check console (F12)
2. Look for error messages
3. Verify servers are running
4. Try different browser
5. Restart your computer if needed

**Your app is running! Just access it at: http://localhost:5174**
