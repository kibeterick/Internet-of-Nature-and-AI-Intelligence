# 🎯 TERMINAL COMMANDS - COPY & PASTE

## 🔴 ISSUE 1: Mobile Build Failed (NDK Corrupted)

## 🔴 ISSUE 2: Web App Port Conflict

---

## ✅ FIX MOBILE APP

### Run this command:

```bash
python fix_ndk_and_build.py
```

**What it does:**

1. Deletes corrupted NDK folder
2. Kills Java processes
3. Cleans .gradle folder
4. Runs Flutter clean
5. Builds APK (NDK auto-downloads)

**Time:** 15-20 minutes (includes NDK download)

---

## ✅ FIX WEB APP (Port Conflict)

### Option 1: Kill the process using port 3000

```bash
netstat -ano | findstr :3000
```

Then kill the PID shown:

```bash
taskkill /F /PID <PID_NUMBER>
```

### Option 2: Use different port

```bash
npm run dev -- --port 5173
```

### Option 3: Kill all Node processes

```bash
taskkill /F /IM node.exe
```

Then run:

```bash
npm run dev
```

---

## 🚀 DEPLOY WEB APP (Skip Mobile)

Your web app is already built. Just deploy it:

```bash
firebase deploy --only hosting
```

**Live URL:** `https://flutter-ai-playground-214d7.web.app`

---

## 📊 SUMMARY

### Mobile App Status:

- ❌ Build failed (NDK corrupted)
- ✅ Fix ready: `python fix_ndk_and_build.py`
- ⏱️ Time: 15-20 minutes

### Web App Status:

- ✅ Code complete
- ✅ Build complete
- ❌ Port 3000 in use
- ✅ Can deploy now: `firebase deploy --only hosting`

---

## 💡 RECOMMENDATION

**Skip mobile build for now. Deploy web app first:**

```bash
firebase deploy --only hosting
```

Your website will be live in 2-3 minutes!

Then fix mobile app later when you have time.

---

## 🎯 QUICK COMMANDS

### Deploy Web (Fastest):

```bash
firebase deploy --only hosting
```

### Fix Mobile (Slowest):

```bash
python fix_ndk_and_build.py
```

### Run Web Locally:

```bash
taskkill /F /IM node.exe
npm run dev
```

---

**Choose what you want to do and copy the command!**
