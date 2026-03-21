@echo off
del src\App.tsx
copy src\App_BROKEN_BACKUP.tsx src\App.tsx
echo Original homepage restored!
pause
