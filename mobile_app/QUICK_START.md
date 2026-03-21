# 🚀 Quick Start - Nature & AI Intelligence Mobile App

## ⚡ Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd mobile_app
flutter pub get
```

### 2. Configure Firebase

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure your project
flutterfire configure
```

### 3. Run the App

```bash
flutter run
```

---

## 📱 Build APK for Android

```bash
flutter build apk --release
```

Your APK will be at: `build/app/outputs/flutter-apk/app-release.apk`

---

## 🎯 Key Commands

| Command                   | Description                 |
| ------------------------- | --------------------------- |
| `flutter pub get`         | Install dependencies        |
| `flutter run`             | Run app on connected device |
| `flutter build apk`       | Build Android APK           |
| `flutter build appbundle` | Build for Play Store        |
| `flutter clean`           | Clean build files           |
| `flutter doctor`          | Check Flutter setup         |

---

## 🔥 Firebase Setup (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication → Google Sign-In
4. Run `flutterfire configure` in terminal
5. Follow the prompts

---

## 📲 Test on Your Phone

### Android:

1. Enable Developer Options on your phone
2. Enable USB Debugging
3. Connect phone via USB
4. Run `flutter run`

### iOS (Mac only):

1. Connect iPhone
2. Trust computer on iPhone
3. Run `flutter run`

---

## 🌐 Deploy to Web

```bash
flutter build web
```

Output in `build/web/` - deploy to Firebase Hosting, Netlify, or Vercel

---

## ✅ Checklist

- [ ] Flutter SDK installed
- [ ] Dependencies installed (`flutter pub get`)
- [ ] Firebase configured (`flutterfire configure`)
- [ ] Google Sign-In enabled in Firebase Console
- [ ] App runs successfully (`flutter run`)
- [ ] APK built (`flutter build apk`)

---

## 🎉 You're Done!

Your mobile app is ready. Run `flutter run` to see it live!

For detailed instructions, see `FLUTTER_APP_GUIDE.md`
