# Nature & AI Intelligence - Flutter Mobile App

## 🚀 Complete Setup Guide

### Prerequisites

- Flutter SDK installed (C:\flutter)
- Android Studio or VS Code with Flutter extensions
- Firebase account
- Google Cloud Console account (for Google Sign-In)

---

## 📱 Step 1: Install Dependencies

```bash
cd mobile_app
flutter pub get
```

---

## 🔥 Step 2: Configure Firebase

### 2.1 Install FlutterFire CLI

```bash
dart pub global activate flutterfire_cli
```

### 2.2 Configure Firebase for your project

```bash
flutterfire configure
```

This will:

- Create/select a Firebase project
- Register your app for Android, iOS, and Web
- Generate `firebase_options.dart` with your credentials

### 2.3 Update Firebase Configuration

The `firebase_options.dart` file will be auto-generated. Make sure it's in `lib/` directory.

---

## 🔐 Step 3: Setup Google Sign-In

### For Android:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication → Sign-in method
4. Enable Google Sign-In
5. Download `google-services.json`
6. Place it in `android/app/`

### For iOS:

1. Download `GoogleService-Info.plist`
2. Place it in `ios/Runner/`
3. Update `ios/Runner/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR-CLIENT-ID</string>
        </array>
    </dict>
</array>
```

---

## 📦 Step 4: Update Android Configuration

### android/app/build.gradle

Add at the bottom:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### android/build.gradle

Add to dependencies:

```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

---

## 🏃 Step 5: Run the App

### Run on Android Emulator/Device

```bash
flutter run
```

### Run on iOS Simulator (Mac only)

```bash
flutter run -d ios
```

### Run on Web

```bash
flutter run -d chrome
```

---

## 📲 Step 6: Build for Production

### Android APK

```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### iOS (Mac only)

```bash
flutter build ios --release
```

---

## 🌐 Step 7: Deploy to Stores

### Google Play Store

1. Create a Google Play Developer account ($25 one-time fee)
2. Create a new app in Play Console
3. Upload the `.aab` file
4. Fill in store listing details
5. Submit for review

### Apple App Store

1. Create an Apple Developer account ($99/year)
2. Create app in App Store Connect
3. Archive and upload via Xcode
4. Submit for review

---

## 🔧 App Features

### ✅ Implemented Features:

- Firebase Authentication with Google Sign-In
- Real-time environmental data dashboard
- Interactive global map with markers
- Species identification (camera integration)
- User profile and statistics
- Alert system for environmental warnings
- Beautiful dark theme UI

### 📊 Dashboard Metrics:

- Temperature monitoring
- Humidity levels
- Air quality index
- CO2 levels
- Soil moisture

### 🗺️ Map Features:

- Global ecosystem visualization
- Location markers
- Filter options

### 🌿 Species Tracking:

- Camera integration
- Species identification
- Sighting history
- Location tracking

---

## 🔗 Connect to Your Backend

Update `lib/providers/data_provider.dart` to connect to your web backend:

```dart
final String baseUrl = 'https://your-backend-url.com/api';

Future<void> fetchEnvironmentalData() async {
  try {
    final response = await _dio.get('$baseUrl/environmental-data');
    _environmentalData = response.data;
    notifyListeners();
  } catch (e) {
    // Handle error
  }
}
```

---

## 📱 Testing

### Run Tests

```bash
flutter test
```

### Check for Issues

```bash
flutter analyze
```

### Format Code

```bash
flutter format .
```

---

## 🎨 Customization

### Change App Name

Edit `pubspec.yaml`:

```yaml
name: your_app_name
```

### Change App Icon

1. Add your icon to `assets/icons/app_icon.png`
2. Use `flutter_launcher_icons` package
3. Run: `flutter pub run flutter_launcher_icons`

### Change Theme Colors

Edit `lib/utils/theme.dart`

---

## 🐛 Troubleshooting

### Firebase not initializing

- Ensure `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is in the correct location
- Run `flutterfire configure` again

### Google Sign-In not working

- Check SHA-1 fingerprint is added to Firebase
- Verify OAuth client ID is correct
- Enable Google Sign-In in Firebase Console

### Build errors

```bash
flutter clean
flutter pub get
flutter run
```

---

## 📚 Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Firebase for Flutter](https://firebase.flutter.dev/)
- [Flutter Map Package](https://pub.dev/packages/flutter_map)
- [Provider State Management](https://pub.dev/packages/provider)

---

## 🚀 Quick Start Commands

```bash
# Navigate to mobile app
cd mobile_app

# Get dependencies
flutter pub get

# Configure Firebase
flutterfire configure

# Run app
flutter run

# Build APK
flutter build apk --release
```

---

## 📞 Support

For issues or questions:

- Check Flutter documentation
- Review Firebase setup guide
- Ensure all dependencies are installed

---

## 🎉 You're Ready!

Your Nature & AI Intelligence mobile app is ready to deploy!

Run `flutter run` to see it in action.
