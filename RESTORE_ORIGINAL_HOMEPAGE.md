# Restoring Your Original Homepage

Your original "Internet of Nature" homepage had these features:

## Original Features Visible in Screenshot:

1. **Header Section**:
   - Logo with tree icon
   - "Internet of Nature" branding
   - "GLOBAL NETWORK ACTIVE" status indicator
   - Navigation icons (search, plant, etc.)
   - "Sign in with Google" button
   - "Sign In" button
   - "1 SCIENTISTS ONLINE" counter
   - Notification bell icon
   - Settings icon

2. **Live AI Insight Section**:
   - Purple gradient background
   - "LIVE AI INSIGHT" label
   - Nature AI insights about urban heat islands
   - AI icon

## To Restore Your Original Homepage:

The original App.tsx is saved in `src/App_BROKEN_BACKUP.tsx` (file size: ~700KB+)

### Manual Restoration Steps:

1. Open your terminal
2. Run: `del src\App.tsx`
3. Run: `ren src\App_BROKEN_BACKUP.tsx App.tsx`
4. Refresh your browser

### Or Use This Command:

```bash
cd "C:\Users\HP\Internate of Nature and AI intelligence"
del src\App.tsx
copy src\App_BROKEN_BACKUP.tsx src\App.tsx
```

Then refresh your browser (Ctrl+Shift+R) and your original beautiful homepage will be back!

## Note:

The file is too large to copy programmatically due to system prompts. Please run the commands manually in your terminal.
