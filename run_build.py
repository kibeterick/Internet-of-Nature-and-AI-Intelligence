import os
import subprocess
import shutil

print("=" * 60)
print("FIXING GRADLE AND BUILDING MOBILE APP")
print("=" * 60)

# Kill Java processes
print("\n[1/4] Killing Java processes...")
try:
    subprocess.run(['taskkill', '/F', '/IM', 'java.exe'], capture_output=True)
    print("✓ Done")
except:
    print("✓ No Java processes found")

# Delete .gradle
print("\n[2/4] Deleting .gradle folder...")
gradle_path = os.path.join('mobile_app', 'android', '.gradle')
if os.path.exists(gradle_path):
    shutil.rmtree(gradle_path, ignore_errors=True)
    print("✓ Deleted .gradle")
else:
    print("✓ Already clean")

# Flutter clean
print("\n[3/4] Running Flutter clean...")
os.chdir('mobile_app')
subprocess.run([r'C:\flutter\bin\flutter.bat', 'clean'])
print("✓ Flutter clean done")

# Build APK
print("\n[4/4] Building APK...")
print("This will take 10-15 minutes. Please wait...\n")
result = subprocess.run([r'C:\flutter\bin\flutter.bat', 'build', 'apk', '--debug'])

if result.returncode == 0:
    print("\n" + "=" * 60)
    print("✓ BUILD SUCCESSFUL!")
    print("=" * 60)
    print("\nAPK: mobile_app\\build\\app\\outputs\\flutter-apk\\app-debug.apk")
else:
    print("\n✗ Build failed. Check errors above.")
