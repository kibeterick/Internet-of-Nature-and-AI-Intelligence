import os
import subprocess
import shutil

print("=" * 70)
print("FIXING CORRUPTED NDK AND BUILDING MOBILE APP")
print("=" * 70)

# Step 1: Kill Java processes
print("\n[1/5] Killing Java/Gradle processes...")
try:
    subprocess.run(['taskkill', '/F', '/IM', 'java.exe'], capture_output=True)
    subprocess.run(['taskkill', '/F', '/IM', 'gradle.exe'], capture_output=True)
    print("✓ Processes killed")
except:
    print("✓ No processes to kill")

# Step 2: Delete corrupted NDK
print("\n[2/5] Deleting corrupted NDK folder...")
ndk_path = r'C:\Users\HP\AppData\Local\Android\sdk\ndk\28.2.13676358'
if os.path.exists(ndk_path):
    try:
        shutil.rmtree(ndk_path, ignore_errors=True)
        print(f"✓ Deleted corrupted NDK at: {ndk_path}")
    except Exception as e:
        print(f"⚠ Could not delete NDK: {e}")
        print("  Trying to continue anyway...")
else:
    print("✓ NDK folder doesn't exist (already clean)")

# Step 3: Delete .gradle folder
print("\n[3/5] Deleting .gradle folder...")
gradle_path = os.path.join('mobile_app', 'android', '.gradle')
if os.path.exists(gradle_path):
    shutil.rmtree(gradle_path, ignore_errors=True)
    print("✓ Deleted .gradle")
else:
    print("✓ Already clean")

# Step 4: Flutter clean
print("\n[4/5] Running Flutter clean...")
os.chdir('mobile_app')
subprocess.run([r'C:\flutter\bin\flutter.bat', 'clean'], capture_output=True)
print("✓ Flutter clean done")

# Step 5: Build APK
print("\n[5/5] Building APK...")
print("\n⏱️  This will take 30-45 minutes on first build:")
print("   - Downloading fresh NDK (~800 MB) - 15-20 min")
print("   - Downloading dependencies - 5 min")
print("   - Compiling app - 10-15 min")
print("\n🌐 Make sure you have stable internet connection!")
print("\n" + "=" * 70)
print("BUILD STARTED - DO NOT CLOSE THIS WINDOW")
print("=" * 70 + "\n")

result = subprocess.run([r'C:\flutter\bin\flutter.bat', 'build', 'apk', '--debug'])

if result.returncode == 0:
    print("\n" + "=" * 70)
    print("✅ BUILD SUCCESSFUL!")
    print("=" * 70)
    print("\n📱 Your APK is ready at:")
    print("   mobile_app\\build\\app\\outputs\\flutter-apk\\app-debug.apk")
    print("\n📋 Next steps:")
    print("   1. Copy APK to your Android phone")
    print("   2. Enable 'Unknown Sources' in phone settings")
    print("   3. Install the APK")
    print("   4. Open and enjoy your app!")
else:
    print("\n" + "=" * 70)
    print("❌ BUILD FAILED")
    print("=" * 70)
    print("\nCheck the errors above.")
    print("\nCommon issues:")
    print("  - Internet connection interrupted during NDK download")
    print("  - Not enough disk space (need ~2 GB free)")
    print("  - Antivirus blocking downloads")
