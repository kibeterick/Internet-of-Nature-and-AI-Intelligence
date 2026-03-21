import os
import shutil
import subprocess

print("=" * 60)
print("FIXING NDK AND BUILDING MOBILE APP")
print("=" * 60)

# Fix 1: Delete corrupted NDK
print("\n[1/5] Deleting corrupted NDK...")
ndk_path = r'C:\Users\HP\AppData\Local\Android\sdk\ndk\28.2.13676358'
if os.path.exists(ndk_path):
    try:
        shutil.rmtree(ndk_path, ignore_errors=True)
        print(f"✓ Deleted: {ndk_path}")
    except Exception as e:
        print(f"Note: {e}")
else:
    print("✓ NDK folder doesn't exist")

# Fix 2: Kill Java processes
print("\n[2/5] Killing Java processes...")
subprocess.run(['taskkill', '/F', '/IM', 'java.exe'], capture_output=True)
print("✓ Done")

# Fix 3: Delete .gradle
print("\n[3/5] Deleting .gradle folder...")
gradle_path = os.path.join('mobile_app', 'android', '.gradle')
if os.path.exists(gradle_path):
    shutil.rmtree(gradle_path, ignore_errors=True)
    print("✓ Deleted .gradle")
else:
    print("✓ Already clean")

# Fix 4: Flutter clean
print("\n[4/5] Running Flutter clean...")
os.chdir('mobile_app')
subprocess.run([r'C:\flutter\bin\flutter.bat', 'clean'])
print("✓ Flutter clean done")

# Fix 5: Build APK (NDK will auto-download)
print("\n[5/5] Building APK...")
print("NDK will be downloaded automatically (this adds 5 minutes)")
print("Total time: 15-20 minutes. Please wait...\n")
result = subprocess.run([r'C:\flutter\bin\flutter.bat', 'build', 'apk', '--debug'])

if result.returncode == 0:
    print("\n" + "=" * 60)
    print("✓ BUILD SUCCESSFUL!")
    print("=" * 60)
    print("\nAPK: mobile_app\\build\\app\\outputs\\flutter-apk\\app-debug.apk")
else:
    print("\n✗ Build failed. Check errors above.")
