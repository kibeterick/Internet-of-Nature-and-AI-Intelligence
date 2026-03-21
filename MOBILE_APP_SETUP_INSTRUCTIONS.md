# 📱 Mobile App Setup Instructions

## ✅ Your Flutter App is Ready!

I've created a complete Flutter mobile app in the `mobile_app/` folder with all features from your web system.

---

## 🚀 Quick Setup (Follow These Steps)

### Step 1: Open Terminal in Mobile App Folder

**Option A: Using File Explorer**

1. Open File Explorer
2. Navigate to: `C:\Users\HP\Internate of Nature and AI intelligence\mobile_app`
3. Type `cmd` in the address bar and press Enter
4. A command prompt will open in that folder

**Option B: Using Command Prompt**

1. Open Command Prompt
2. Run: `cd "C:\Users\HP\Internate of Nature and AI intelligence\mobile_app"`

---

### Step 2: Install Dependencies

In the command prompt, run:

```bash
C:\flutter\bin\flutter.bat pub get
```

This will install all required packages.

---

### Step 3: Configure Firebase

```bash
# Install FlutterFire CLI (one-time setup)
dart pub global activate flutterfire_cli

# Configure your Firebase project
flutterfire configure
```

Follow the prompts to:

- Select or create a Firebase project
- Choose platforms (Android, iOS, Web)
- Generate firebase_options.dart

---

### Step 4: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click **Google** → **Enable** → **Save**

---

### Step 5: Run the App

```bash
C:\flutter\bin\flutter.bat run
```

This will:

- Build the app
- Launch it on a connected device or emulator

---

## 📱 Testing on Your Phone

### Android Phone:

1. Enable **Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging**:
   - Go to Settings → Developer Options
   - Turn on "USB Debugging"
3. Connect phone via USB cable

4. Run: `C:\flutter\bin\flutter.bat run`

---

## 📦 Build APK for Distribution

### Build Release APK:

```bash
C:\flutter\bin\flutter.bat build apk --release
```

Your APK will be at:

```
mobile_app\build\app\outputs\flutter-apk\app-release.apk
```

You can install this APK on any Android device!

---

## 🎯 What's Included

### ✅ Features:

- Firebase Authentication with Google Sign-In
- Real-time Environmental Dashboard
- Interactive Global Map
- Species Identification (Camera)
- User Profile & Statistics
- Alert System
- Beautiful Dark Theme

### 📂 Screens:

- Splash Screen
- Login Screen (Google Sign-In)
- Dashboard (Environmental Metrics)
- Map (Global Ecosystem)
- Species Tracking
- User Profile

### 🎨 UI Components:

- Metric Cards (Temperature, Humidity, Air Quality, CO2)
- Alert Cards
- Navigation Bar
- Custom Theme

---

## 📚 Documentation Files

I've created comprehensive guides:

1. **mobile_app/README.md** - Project overview
2. **mobile_app/FLUTTER_APP_GUIDE.md** - Complete setup guide
3. **mobile_app/QUICK_START.md** - Quick start guide
4. **mobile_app/DEPLOYMENT_CHECKLIST.md** - Deployment steps
5. **FLUTTER_APP_COMPLETE.md** - Summary of everything

---

## 🔥 Firebase Setup (Important!)

Before the app works, you MUST configure Firebase:

### 1. Create Firebase Project

- Go to https://console.firebase.google.com/
- Click "Add project"
- Follow the wizard

### 2. Enable Authentication

- In Firebase Console, go to **Authentication**
- Click **Get Started**
- Go to **Sign-in method** tab
- Enable **Google** provider

### 3. Create Firestore Database

- Go to **Firestore Database**
- Click **Create database**
- Start in **test mode** (for development)

### 4. Run FlutterFire Configure

```bash
cd "C:\Users\HP\Internate of Nature and AI intelligence\mobile_app"
flutterfire configure
```

This will:

- Connect your app to Firebase
- Generate `firebase_options.dart`
- Download config files

---

## 🚀 Deploy to Google Play Store

### 1. Build App Bundle

```bash
C:\flutter\bin\flutter.bat build appbundle --release
```

### 2. Create Play Console Account

- Go to https://play.google.com/console
- Pay $25 one-time fee
- Create developer account

### 3. Create New App

- Click "Create app"
- Fill in app details
- Upload the app bundle from:
  ```
  mobile_app\build\app\outputs\bundle\release\app-release.aab
  ```

### 4. Complete Store Listing

- Add screenshots
- Write description
- Add app icon
- Set category
- Submit for review

---

## 🍎 Deploy to Apple App Store (Mac Required)

### 1. Build iOS App

```bash
flutter build ios --release
```

### 2. Create App Store Connect Account

- Go to https://developer.apple.com/
- Pay $99/year
- Create developer account

### 3. Upload via Xcode

- Open project in Xcode
- Archive the app
- Upload to App Store Connect
- Submit for review

---

## 🌐 Deploy as Web App (Bonus!)

### 1. Build Web Version

```bash
C:\flutter\bin\flutter.bat build web
```

### 2. Deploy to Firebase Hosting

```bash
firebase init hosting
firebase deploy
```

Or upload the `build/web/` folder to:

- Netlify
- Vercel
- GitHub Pages

---

## 🐛 Troubleshooting

### "Flutter not found"

Use full path: `C:\flutter\bin\flutter.bat`

### "Firebase not configured"

Run: `flutterfire configure`

### "Google Sign-In not working"

1. Enable Google Sign-In in Firebase Console
2. Add SHA-1 fingerprint (for Android)
3. Download google-services.json

### "Build failed"

```bash
C:\flutter\bin\flutter.bat clean
C:\flutter\bin\flutter.bat pub get
C:\flutter\bin\flutter.bat run
```

---

## 📞 Quick Commands Reference

```bash
# Navigate to app folder
cd "C:\Users\HP\Internate of Nature and AI intelligence\mobile_app"

# Install dependencies
C:\flutter\bin\flutter.bat pub get

# Configure Firebase
flutterfire configure

# Run app
C:\flutter\bin\flutter.bat run

# Build APK
C:\flutter\bin\flutter.bat build apk --release

# Build for Play Store
C:\flutter\bin\flutter.bat build appbundle --release

# Check Flutter setup
C:\flutter\bin\flutter.bat doctor
```

---

## 🎉 You're All Set!

Your mobile app is complete with:

- ✅ Professional UI
- ✅ Firebase integration
- ✅ Google Sign-In
- ✅ Real-time data
- ✅ Interactive map
- ✅ Species tracking
- ✅ Ready for deployment

**Next Step**: Open terminal in `mobile_app` folder and run:

```bash
C:\flutter\bin\flutter.bat pub get
```

Then configure Firebase and run the app!

---

## 📱 App Preview

Your app includes:

- **Splash Screen**: Beautiful animated intro
- **Login**: Google Sign-In button
- **Dashboard**: Environmental metrics with cards
- **Map**: Interactive global ecosystem map
- **Species**: Camera-based identification
- **Profile**: User stats and settings

All with a beautiful dark theme matching your web app!

---

Made with ❤️ for Nature & AI Intelligence
