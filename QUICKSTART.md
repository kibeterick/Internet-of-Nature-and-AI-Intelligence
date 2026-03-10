# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key (minimum required)
# Get it from: https://makersuite.google.com/app/apikey
```

Minimum required in `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5173

That's it! 🎉

## 🔧 Optional Configuration

### Firebase Authentication (Recommended)
Add these to `.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Payment Integration (Optional)
For PayPal:
```env
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET_KEY=your_paypal_secret
VITE_PAYPAL_ENV=sandbox
```

For Stripe:
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 📦 Build for Production

```bash
npm run build
npm run start
```

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
Change the port in `.env`:
```env
PORT=3001
```

### WebSocket connection failed
Make sure both frontend (5173) and backend (3000) are running.

## 📚 Learn More

- Full setup guide: [SETUP.md](SETUP.md)
- All improvements: [IMPROVEMENTS.md](IMPROVEMENTS.md)
- Project README: [README.md](README.md)

## 🆘 Need Help?

1. Check [SETUP.md](SETUP.md) for detailed troubleshooting
2. Review error messages in browser console
3. Check server logs in terminal
4. Verify all environment variables are set correctly

Happy coding! 🌱
