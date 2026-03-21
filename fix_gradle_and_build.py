import os
import shutil
import subprocess
import time

print("=" * 60)
print("GRADLE LOCK FIX AND BUILD SCRIPT")
print("=" * 60)

# Step 1: Kill all Java processes
print("\n[1/5] Killing all Java/Gradle processes...")
try:
    subprocess.run(['taskkill', '/F', '/IM', 'java.exe'], 
                   capture_output=True, text=True)
    print("✓ Java processes terminated")
except Exception as e:
    print(f"Note: {e}")

time.sleep(2)

# Step 2: Delete .gradle folder
print("\n[2/5] Deleting .gradle folder...")
gradle_path = r"mobile_app\android\.gradle"
if os.path.exists(gradle_path):
    try:
        shutil.rmtree(gradle_path)
        print(f"✓ Deleted: {gradle_path}")
    except Exception as e:
        print(f"✗ Error deleting .gradle: {e}")
else:
    print("✓ .gradle folder doesn't exist (already clean)")

# Step 3: Delete build folders
print("\n[3/5] Deleting build folders...")
build_paths = [
    r"mobile_app\android\app\build",
    r"mobile_app\android\build",
    r"mobile_app\build"
]
for build_path in build_paths:
    if os.path.exists(build_path):
        try:
            shutil.rmtree(build_path)
            print(f"✓ Deleted: {build_path}")
        except Exception as e:
            print(f"Note: {e}")

# Step 4: Flutter clean
print("\n[4/5] Running Flutter clean...")
try:
    result = subprocess.run(
        [r'C:\flutter\bin\flutter.bat', 'clean'],
        cwd='mobile_app',
        capture_output=True,
        text=True,
        timeout=60
    )
    print("✓ Flutter clean completed")
except Exception as e:
    print(f"✗ Error: {e}")

time.sleep(2)

# Step 5: Build APK
print("\n[5/5] Building APK (debug mode)...")
print("This will take 5-10 minutes. Please wait...")
print("-" * 60)

try:
    process = subprocess.Popen(
        [r'C:\flutter\bin\flutter.bat', 'build', 'apk', '--debug'],
        cwd='mobile_app',
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Print output in real-time
    for line in process.stdout:
        print(line, end='')
    
    process.wait()
    
    if process.returncode == 0:
        print("\n" + "=" * 60)
        print("✓ BUILD SUCCESSFUL!")
        print("=" * 60)
        print("\nAPK Location:")
        print("mobile_app\\build\\app\\outputs\\flutter-apk\\app-debug.apk")
        print("\nYou can now install this APK on your Android device!")
    else:
        print("\n" + "=" * 60)
        print("✗ BUILD FAILED")
        print("=" * 60)
        print(f"Exit code: {process.returncode}")
        
except subprocess.TimeoutExpired:
    print("\n✗ Build timed out after 30 minutes")
except Exception as e:
    print(f"\n✗ Error during build: {e}")

print("\n" + "=" * 60)
print("SCRIPT COMPLETE")
print("=" * 60)
