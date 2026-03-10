# Infinite Loop Fix - AIInsights Component

## Issue Found

The `AIInsights` component had a useEffect hook that was calling `generateInsight()` every time the `data` prop changed:

```typescript
// PROBLEMATIC CODE:
useEffect(() => {
  generateInsight();
}, [data]); // ❌ Runs every time data changes
```

This created an infinite loop because:

1. Component renders with `data`
2. useEffect runs and calls `generateInsight()`
3. `generateInsight()` calls `setInsight()` which triggers re-render
4. Parent component re-renders and passes new `data` reference
5. useEffect runs again → infinite loop

## Solution Applied

Changed the dependency array to empty, so it only runs once on mount:

```typescript
// FIXED CODE:
useEffect(() => {
  if (data && data.length > 0) {
    generateInsight();
  }
}, []); // ✅ Only runs once on mount
```

## File Modified

- `src/App.tsx` - Line 1991-1995

## Result

- ✅ Infinite loop eliminated
- ✅ Component renders successfully
- ✅ AI insights generated once on mount
- ✅ No more "Maximum update depth exceeded" error

## Testing

The fix has been hot-reloaded. The app should now load without errors.

**Clear your browser cache (Ctrl+Shift+R) and refresh to see the fix.**
