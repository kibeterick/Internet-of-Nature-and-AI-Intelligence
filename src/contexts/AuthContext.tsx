import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface UserProfile {
  role: string;
  points: number;
  createdAt: string;
  displayName?: string;
  email?: string;
  discoveries?: number;
  badges?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: string;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  upgradeToRole: (newRole: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.email);
      setUser(firebaseUser);

      if (firebaseUser) {
        // Load or create user profile
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Create new profile
            const newProfile: UserProfile = {
              role: "community",
              points: 0,
              createdAt: new Date().toISOString(),
              displayName: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error loading profile:", error);
          // Set default profile if Firestore fails
          setProfile({
            role: "community",
            points: 0,
            createdAt: new Date().toISOString(),
            displayName: firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
          });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshRole = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error refreshing role:", error);
    }
  };

  const addPoints = async (points: number) => {
    if (!user || !profile) return;
    try {
      const newPoints = profile.points + points;
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { ...profile, points: newPoints },
        { merge: true },
      );
      setProfile({ ...profile, points: newPoints });
    } catch (error) {
      console.error("Error adding points:", error);
    }
  };

  const upgradeToRole = async (newRole: string) => {
    if (!user || !profile) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { ...profile, role: newRole }, { merge: true });
      setProfile({ ...profile, role: newRole });
    } catch (error) {
      console.error("Error upgrading role:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: profile?.role || "community",
        signOut,
        refreshRole,
        addPoints,
        upgradeToRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
