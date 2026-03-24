import shutil

# Restore working App.tsx from backup
shutil.copy('src/App_FROM_GIT.tsx', 'src/App.tsx')
print("✅ App.tsx restored from backup")
