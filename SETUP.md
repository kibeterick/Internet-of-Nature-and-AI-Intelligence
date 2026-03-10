# Setup Guide - Internet of Nature

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

#### Required Variables:

**Gemini AI** (Required for AI features):
- Get your API key from: https://makersuite.google.com/app/apikey
- Set `VITE_GEMINI_API_KEY` and `GEMINI_API_KEY`

**Firebase** (Required for authentication):
1. Go to https://console.firebase.google.com/
2. Create a new project or use existing
3. Enable Authentication (Email/Password, Google, etc.)
4. Enable Firestore Database
5. Copy configuration from Project Settings > General > Your apps
6. Fill in all `VITE_FIREBASE_*` variables

#### Optional Variables:

**PayPal** (For subscription payments):
1. Go to https://developer.paypal.com/
2. Create an app in Dashboard
3. Copy Client ID and Secret
4. Set `VITE_PAYPAL_CLIENT_ID` and `PAYPAL_SECRET_KEY`
5. Use `sandbox` for testing, `production` for live

**Stripe** (Alternative payment method):
1. Go to https://dashboard.stripe.com/
2. Get API keys from Developers > API keys
3. Set `VITE_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`

**GitHub OAuth** (For GitHub integration):
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Secret
5. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

### 3. Start Development Server

```bash
npm run dev
```

This will start:
- Frontend dev server on http://localhost:5173
- Backend API server on http://localhost:3000
- WebSocket server for real-time updates

### 4. Build for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### Issue: "Firebase API key is missing"
- Check that `VITE_FIREBASE_API_KEY` is set in `.env`
- Restart the dev server after changing `.env`

### Issue: "Gemini AI not working"
- Verify `VITE_GEMINI_API_KEY` is correct
- Check API quota at https://makersuite.google.com/
- Ensure API key has proper permissions

### Issue: "WebSocket connection failed"
- Check that port 3000 is not in use
- Verify firewall settings
- Try restarting the server

### Issue: "Payment integration not working"
- Verify you're using test/sandbox credentials for development
- Check that secret keys are set on server side
- Review browser console for detailed errors

## Development Tips

1. **Hot Reload**: Frontend changes auto-reload, but server changes require restart
2. **API Testing**: Use `/api/health` endpoint to verify server is running
3. **Database**: Currently uses in-memory storage. Consider adding PostgreSQL/MongoDB for production
4. **Environment**: Use `.env.local` for local overrides (not tracked by git)

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production API keys (not sandbox/test)
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up database (replace in-memory storage)
6. Configure rate limiting
7. Set up monitoring and logging

### Recommended Platforms
- **Vercel**: Easy deployment for frontend + serverless functions
- **Railway**: Full-stack deployment with database
- **Firebase Hosting**: Integrated with Firebase services
- **AWS/GCP**: Full control and scalability

### Security Checklist
- [ ] All API keys in environment variables
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (if using SQL)
- [ ] XSS protection
- [ ] CSRF tokens for state-changing operations
- [ ] Secure cookie settings
- [ ] Regular dependency updates

## Architecture Overview

```
┌─────────────────┐
│   React App     │  (Port 5173 in dev)
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/WS
         │
┌────────▼────────┐
│  Express Server │  (Port 3000)
│   + WebSocket   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ APIs │  │ WSS   │
│      │  │       │
└──┬───┘  └───────┘
   │
   ├─ Firebase (Auth + Firestore)
   ├─ Gemini AI (NLP + Vision)
   ├─ PayPal/Stripe (Payments)
   └─ GitHub (OAuth + API)
```

## Next Steps

1. Customize branding and content
2. Add more sensor types
3. Implement data persistence
4. Add user roles and permissions
5. Create admin dashboard
6. Set up CI/CD pipeline
7. Add comprehensive testing
8. Implement analytics
9. Create mobile app version
10. Scale infrastructure

## Support

For issues or questions:
- Check existing GitHub issues
- Review documentation
- Contact development team
- Join community Discord/Slack

Happy coding! 🌱
