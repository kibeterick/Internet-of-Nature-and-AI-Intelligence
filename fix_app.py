#!/usr/bin/env python3
"""
Fix the App.tsx file by removing duplicate lines and adding proper return statement
"""

# Read the file
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the problematic section (around line 10797-10801)
# Line 10797 (index 10796): }
# Line 10798 (index 10797): empty
# Line 10799 (index 10798): const { user, profile, signOut, refreshRole, addPoints } = useAuth();
# Line 10800 (index 10799): const [isConfigOpen, setIsConfigOpen] = useState(false);
# Line 10801 (index 10800): "min-h-screen transition-colors duration-500",

# We need to:
# 1. Keep line 10797 (the closing brace)
# 2. Remove lines 10799-10800 (duplicate declarations)
# 3. Add proper return statement before line 10801

# Create the fix
fixed_lines = lines[:10798]  # Keep everything up to and including line 10798 (empty line after })

# Add the proper authenticated dashboard return statement
fixed_lines.append('\n')
fixed_lines.append('  // User is authenticated - show the full dashboard\n')
fixed_lines.append('  console.log("AppContent: User authenticated:", user?.email);\n')
fixed_lines.append('\n')
fixed_lines.append('  return (\n')
fixed_lines.append('    <div\n')
fixed_lines.append('      className={cn(\n')

# Continue with the rest of the file starting from line 10801 (index 10800)
fixed_lines.extend(lines[10800:])

# Write the fixed file
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("Fixed App.tsx successfully!")
print(f"Removed lines 10799-10800 (duplicate declarations)")
print(f"Added proper return statement for authenticated dashboard")
