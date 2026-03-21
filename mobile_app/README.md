# 🌿 Nature & AI Intelligence - Mobile App

A comprehensive environmental monitoring and species tracking mobile application built with Flutter.

## 📱 Features

### 🎯 Core Features

- **Real-time Environmental Monitoring**: Track temperature, humidity, air quality, CO2 levels, and soil moisture
- **Global Ecosystem Map**: Interactive map showing environmental data points worldwide
- **Species Identification**: Use your camera to identify plants and animals with AI
- **Alert System**: Get notified about environmental changes and warnings
- **User Profiles**: Track your discoveries, badges, and contributions
- **Google Sign-In**: Secure authentication with Firebase

### 🎨 UI/UX

- Beautiful dark theme optimized for readability
- Smooth animations and transitions
- Responsive design for all screen sizes
- Material Design 3 components

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd mobile_app
flutter pub get

# 2. Configure Firebase
flutterfire configure

# 3. Run the app
flutter run
```

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

---

## 📦 Tech Stack

- **Framework**: Flutter 3.11+
- **State Management**: Provider
- **Backend**: Firebase (Auth, Firestore)
- **Maps**: flutter_map
- **Charts**: fl_chart
- **HTTP**: Dio
- **Authentication**: Google Sign-In

---

## 📂 Project Structure

```
mobile_app/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── firebase_options.dart     # Firebase configuration
│   ├── providers/                # State management
│   │   ├── auth_provider.dart
│   │   └── data_provider.dart
│   ├── screens/                  # App screens
│   │   ├── splash_screen.dart
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── dashboard_screen.dart
│   │   ├── map_screen.dart
│   │   ├── species_screen.dart
│   │   └── profile_screen.dart
│   ├── widgets/                  # Reusable widgets
│   │   ├── metric_card.dart
│   │   └── alert_card.dart
│   └── utils/                    # Utilities
│       └── theme.dart
├── android/                      # Android configuration
├── ios/                          # iOS configuration
├── assets/                       # Images, icons, animations
└── pubspec.yaml                  # Dependencies

```

---

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Google Sign-In)
3. Create Firestore database
4. Run `flutterfire configure`

### Google Sign-In

1. Add SHA-1 fingerprint to Firebase
2. Download `google-services.json` (Android)
3. Download `GoogleService-Info.plist` (iOS)

See [FLUTTER_APP_GUIDE.md](FLUTTER_APP_GUIDE.md) for complete setup.

---

## 📲 Build & Deploy

### Android APK

```bash
flutter build apk --release
```

### Android App Bundle (Play Store)

```bash
flutter build appbundle --release
```

### iOS (Mac only)

```bash
flutter build ios --release
```

---

## 🧪 Testing

```bash
# Run tests
flutter test

# Analyze code
flutter analyze

# Format code
flutter format .
```

---

## 📱 Screenshots

_Coming soon - Add screenshots of your app here_

---

## 🤝 Contributing

This app is part of the Nature & AI Intelligence ecosystem. Contributions are welcome!

---

## 📄 License

Copyright © 2026 Nature & AI Intelligence

---

## 🔗 Related Projects

- [Web Application](../) - Main web dashboard
- [Backend API](../server.ts) - Node.js backend

---

## 📞 Support

For issues or questions:

- Check [FLUTTER_APP_GUIDE.md](FLUTTER_APP_GUIDE.md)
- Review [QUICK_START.md](QUICK_START.md)
- Contact support team

---

## 🎉 Get Started Now!

```bash
cd mobile_app
flutter pub get
flutterfire configure
flutter run
```

Happy coding! 🚀
