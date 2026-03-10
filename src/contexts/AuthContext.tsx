import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  points: number;
  discoveries: any[];
  badges: string[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: string;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  addPoints: (amount: number) => Promise<void>;
  upgradeToRole: (newRole: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState('contributor');
  const [loading, setLoading] = useState(true);

  const syncProfile = async (firebaseUser: User) => {
    if (!db) return;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Nature Guardian',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'contributor',
        points: 0,
        discoveries: [],
        badges: ['Founding Member'],
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);
      setProfile(newProfile);
      setRole('contributor');
    } else {
      const data = userDoc.data() as UserProfile;
      setProfile(data);
      setRole(data.role || 'contributor');
    }

    // Set up real-time listener for profile changes
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setProfile(data);
        setRole(data.role || 'contributor');
      }
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let profileUnsubscribe: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        profileUnsubscribe = await syncProfile(firebaseUser);
      } else {
        setProfile(null);
        setRole('contributor');
        if (profileUnsubscribe) profileUnsubscribe();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
  };

  const refreshRole = async () => {
    if (user && db) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setRole(userDoc.data().role || 'contributor');
      }
    }
  };

  const addPoints = async (amount: number) => {
    if (user && db && profile) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        points: (profile.points || 0) + amount
      });
    }
  };

  const upgradeToRole = async (newRole: string) => {
    if (user && db) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        role: newRole
      });
      setRole(newRole);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signOut, refreshRole, addPoints, upgradeToRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
