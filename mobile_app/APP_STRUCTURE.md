# 📱 App Structure & Flow

## 🎯 App Navigation Flow

```
Splash Screen (2 seconds)
        ↓
    [Check Auth]
        ↓
   ┌────┴────┐
   ↓         ↓
Login      Home Screen
Screen    (Bottom Nav)
   ↓         ↓
   └────→────┤
        ├─────────┬─────────┬─────────┐
        ↓         ↓         ↓         ↓
    Dashboard   Map    Species   Profile
```

---

## 📂 File Organization

### Providers (State Management)

```
providers/
├── auth_provider.dart
│   ├── signInWithGoogle()
│   ├── signOut()
│   └── user state
│
└── data_provider.dart
    ├── fetchEnvironmentalData()
    ├── fetchAlerts()
    └── environmental metrics
```

### Screens (UI Pages)

```
screens/
├── splash_screen.dart
│   └── Animated logo + loading
│
├── login_screen.dart
│   └── Google Sign-In button
│
├── home_screen.dart
│   └── Bottom navigation (4 tabs)
│
├── dashboard_screen.dart
│   ├── Header with user info
│   ├── Status banner
│   ├── Metric cards (4)
│   └── Alert cards
│
├── map_screen.dart
│   ├── Interactive map
│   └── Location markers
│
├── species_screen.dart
│   ├── Camera button
│   └── Sightings list
│
└── profile_screen.dart
    ├── User avatar
    ├── Statistics
    ├── Menu items
    └── Sign out button
```

### Widgets (Reusable Components)

```
widgets/
├── metric_card.dart
│   ├── Icon
│   ├── Title
│   ├── Value
│   └── Trend indicator
│
└── alert_card.dart
    ├── Alert icon
    ├── Message
    └── Timestamp
```

---

## 🎨 Screen Layouts

### Dashboard Screen

```
┌─────────────────────────────┐
│ Welcome back, [Name]    [👤]│
├─────────────────────────────┤
│ 🟢 GLOBAL NETWORK ACTIVE    │
│    Real-time monitoring     │
├─────────────────────────────┤
│ Environmental Metrics       │
│                             │
│ ┌──────────┐ ┌──────────┐  │
│ │🌡️ Temp   │ │💧 Humid  │  │
│ │  24.5°C  │ │   65%    │  │
│ └──────────┘ └──────────┘  │
│                             │
│ ┌──────────┐ ┌──────────┐  │
│ │💨 Air Q  │ │☁️ CO2    │  │
│ │   85     │ │  420ppm  │  │
│ └──────────┘ └──────────┘  │
├─────────────────────────────┤
│ Active Alerts               │
│                             │
│ ⚠️ High temperature         │
│    detected                 │
└─────────────────────────────┘
```

### Map Screen

```
┌─────────────────────────────┐
│ Global Ecosystem Map    [⚙️] │
├─────────────────────────────┤
│                             │
│        🗺️ MAP VIEW          │
│                             │
│     📍 Markers              │
│                             │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

### Species Screen

```
┌─────────────────────────────┐
│ Species Tracking            │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │     📷 Camera Icon      │ │
│ │                         │ │
│ │   Identify Species      │ │
│ │                         │ │
│ │   [Open Camera]         │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Recent Sightings            │
│                             │
│ 🌿 Species 1                │
│    Location: Sample Area    │
│                             │
│ 🌿 Species 2                │
│    Location: Sample Area    │
└─────────────────────────────┘
```

### Profile Screen

```
┌─────────────────────────────┐
│                             │
│         👤 Avatar           │
│                             │
│       [User Name]           │
│     user@email.com          │
│                             │
├─────────────────────────────┤
│ Discoveries          0      │
├─────────────────────────────┤
│ Badges              0      │
├─────────────────────────────┤
│ Contributions       0      │
├─────────────────────────────┤
│ ⚙️ Settings                 │
│ ❓ Help & Support           │
│ ℹ️ About                    │
├─────────────────────────────┤
│     [Sign Out] 🚪           │
└─────────────────────────────┘
```

---

## 🔄 Data Flow

### Authentication Flow

```
User clicks "Sign in with Google"
        ↓
AuthProvider.signInWithGoogle()
        ↓
Google Sign-In popup
        ↓
Firebase Authentication
        ↓
Create/Update user in Firestore
        ↓
Navigate to Home Screen
```

### Data Fetching Flow

```
Dashboard Screen loads
        ↓
DataProvider.fetchEnvironmentalData()
        ↓
API call (or simulated data)
        ↓
Update state
        ↓
UI rebuilds with new data
```

---

## 🎨 Theme Structure

### Colors

```dart
Primary Green: #10B981
Dark Background: #0F172A
Card Background: #1E293B
Text White: #FFFFFF
Text Gray: #FFFFFF70
```

### Components

```
Cards:
- Border radius: 16px
- Padding: 16px
- Background: #1E293B
- Border: Color with opacity

Buttons:
- Border radius: 12px
- Padding: 16px horizontal, 12px vertical
- Background: #10B981
- Text: White

Icons:
- Size: 24px (default)
- Color: Varies by context
```

---

## 📦 Dependencies Usage

### Firebase

```
firebase_core → Initialize Firebase
firebase_auth → User authentication
cloud_firestore → Database
google_sign_in → Google OAuth
```

### UI

```
flutter_map → Interactive maps
fl_chart → Charts (future use)
shimmer → Loading animations
lottie → Animated icons
```

### State

```
provider → State management
shared_preferences → Local storage
```

### Media

```
image_picker → Camera access
cached_network_image → Image caching
```

### Location

```
geolocator → GPS location
permission_handler → Permissions
```

---

## 🔐 Security

### Authentication

- Firebase handles OAuth
- Secure token storage
- Auto sign-out on token expiry

### Data

- Firestore security rules
- User data isolation
- API key protection

---

## 🚀 Performance

### Optimizations

- Lazy loading of screens
- Image caching
- State management with Provider
- Efficient rebuilds

### Best Practices

- Async/await for API calls
- Error handling
- Loading states
- Pull to refresh

---

## 📱 Platform Support

### Android

- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Permissions: Camera, Location, Internet

### iOS

- Minimum: iOS 12.0
- Permissions: Camera, Location

### Web

- Modern browsers
- Responsive design
- PWA capable

---

## 🎯 Future Enhancements

### Potential Features

- [ ] Push notifications
- [ ] Offline mode
- [ ] Data synchronization
- [ ] Advanced charts
- [ ] Social sharing
- [ ] AR species identification
- [ ] Voice commands
- [ ] Multi-language support

---

This structure provides a solid foundation for your mobile app!
