#!/usr/bin/env python3
"""Fix the AppContent function to show dashboard after login"""

# Read the file
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the temporary welcome message with dashboard
old_code = '''  console.log("AppContent: User authenticated:", user?.email);

  // Temporary: Show a simple success message instead of the full dashboard
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
          <TreePine size={48} />
        </div>
        <h1 className="text-4xl font-bold text-nature-900">
          Welcome, {user?.displayName || user?.email}!
        </h1>
        <p className="text-nature-600">
          Authentication successful. Dashboard is loading...
        </p>
        <div className="text-sm text-nature-400">
          User ID: {user?.uid}
        </div>
        <button
          onClick={() => signOut()}
          className="px-6 py-3 bg-nature-900 text-white rounded-xl font-bold hover:bg-nature-800 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}'''

new_code = '''  console.log("AppContent: User authenticated:", user?.email);

  // Show dashboard after authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Toaster position="top-right" />
      <div className="h-14 bg-[#FFB6C1] w-full" />
      <nav className="px-6 py-8 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-nature-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <TreePine size={28} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">Internet of Nature</h1>
            <p className="text-xs text-nature-500">Global Network Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
            <p className="text-xs text-nature-500">{profile?.role || "Community"}</p>
          </div>
          <button onClick={() => signOut()} className="px-4 py-2 bg-nature-900 text-white rounded-xl font-bold hover:bg-nature-800">
            Sign Out
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={32} />
            <h2 className="text-2xl font-bold">LIVE AI INSIGHT</h2>
          </div>
          <p className="text-lg">Welcome to the Internet of Nature platform! Your dashboard is active and monitoring global ecosystem data.</p>
        </div>
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}'''

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Dashboard code updated successfully!")
else:
    print("❌ Could not find the code to replace")
