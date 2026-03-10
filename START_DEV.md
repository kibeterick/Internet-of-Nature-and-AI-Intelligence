# How to Start Development

## Quick Start (3 Steps)

### Step 1: Kill Existing Node Processes

**Windows (Command Prompt)**:
```cmd
taskkill /F /IM node.exe
```

**Windows (PowerShell)**:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Linux/Mac**:
```bash
killall node
```

### Step 2: Verify Environment Variables

Make sure `.env` file exists and contains at minimum:
```env
VITE_GEMINI_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here
```

### Step 3: Start Development Server

```bash
npm run dev
```

The application will start on:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- WebSocket: ws://localhost:3000

## Troubleshooting

### "Port 3000 already in use"
Kill existing Node processes (see Step 1) or change port in `.env`:
```env
PORT=3001
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "TypeScript errors"
All TypeScript errors have been fixed. If you see any, run:
```bash
npm run lint
```

### "Gemini API not working"
1. Check `.env` file has `VITE_GEMINI_API_KEY`
2. Verify API key is valid at https://makersuite.google.com/
3. Restart dev server after changing `.env`

## What's Running?

When you run `npm run dev`, the following starts:

1. **Express Server** (Port 3000)
   - REST API endpoints
   - WebSocket server for real-time updates
   - Serves built frontend in production

2. **Vite Dev Server** (Port 5173)
   - Hot module replacement
   - Fast refresh
   - Proxies API requests to port 3000

## Development Workflow

1. Make changes to files
2. Frontend changes auto-reload (HMR)
3. Backend changes require server restart
4. Check browser console for errors
5. Check terminal for server logs

## Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run lint

# Clean build artifacts
npm run clean
```

## Browser Access

Once running, open your browser to:
- **Main App**: http://localhost:5173
- **API Health**: http://localhost:3000/api/health

## Success Indicators

You should see:
```
Server running on http://localhost:3000
Connected to Ecosystem Mesh
```

And in browser console:
```
Connected to Ecosystem Mesh
```

## Need Help?

1. Check [QUICKSTART.md](QUICKSTART.md) for 5-minute setup
2. Review [SETUP.md](SETUP.md) for detailed troubleshooting
3. Read [FIXES_APPLIED.md](FIXES_APPLIED.md) for recent fixes
4. Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for project status

Happy coding! 🌱
