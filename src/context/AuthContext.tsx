import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types/maritime';
import { checkAndSeedInitialData } from '../services/maritimeService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: 'admin' | 'operator') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginDemo: (type: 'admin' | 'operator') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'samudera_marine_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore stored session or listen to Firebase Auth
  useEffect(() => {
    // 1. Check local session first
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setProfile(parsed.profile);
        checkAndSeedInitialData().catch(console.error);
      } catch (e) {
        console.error('Failed to parse local session', e);
      }
    }

    // 2. Listen to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const isAdmin =
          currentUser.email === 'arizo4212@gmail.com' ||
          currentUser.email?.includes('admin') ||
          currentUser.displayName?.toLowerCase().includes('admin');

        const authUser: AuthUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || (isAdmin ? 'Administrator Maritim' : 'Operator Logistik'),
        };

        const prof: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: authUser.displayName,
          role: isAdmin ? 'admin' : 'operator',
        };

        setUser(authUser);
        setProfile(prof);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: authUser, profile: prof }));
        checkAndSeedInitialData().catch(console.error);
      } else if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Fallback unblock loading after short timeout
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // First, try Firebase Auth if enabled in the project
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      return;
    } catch (fbErr: any) {
      console.warn('Firebase email auth bypassed/not allowed:', fbErr?.code || fbErr?.message);
    }

    // Database-backed authentication fallback (Firestore / App accounts)
    try {
      const userDocId = trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const userRef = doc(db, 'users', userDocId);
      const userSnap = await getDoc(userRef);

      let authUser: AuthUser;
      let prof: UserProfile;

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password && userData.password !== pass) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }

        const isAdmin = userData.role === 'admin' || trimmedEmail.includes('admin');
        authUser = {
          uid: userSnap.id,
          email: trimmedEmail,
          displayName: userData.displayName || (isAdmin ? 'Administrator Maritim' : 'Staf Operasional'),
        };
        prof = {
          uid: userSnap.id,
          email: trimmedEmail,
          displayName: authUser.displayName,
          role: isAdmin ? 'admin' : 'operator',
        };
      } else {
        // Auto-provision user account in Firestore
        const isAdmin = trimmedEmail.includes('admin') || trimmedEmail === 'arizo4212@gmail.com';
        const displayName = trimmedEmail.split('@')[0];
        
        await setDoc(userRef, {
          email: trimmedEmail,
          password: pass,
          displayName: displayName,
          role: isAdmin ? 'admin' : 'operator',
          createdAt: new Date().toISOString(),
        });

        authUser = {
          uid: userDocId,
          email: trimmedEmail,
          displayName: displayName,
        };
        prof = {
          uid: userDocId,
          email: trimmedEmail,
          displayName: displayName,
          role: isAdmin ? 'admin' : 'operator',
        };
      }

      setUser(authUser);
      setProfile(prof);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: authUser, profile: prof }));
      await checkAndSeedInitialData();
    } catch (err: any) {
      throw new Error(err.message || 'Gagal masuk akun. Silakan coba lagi.');
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    role: 'admin' | 'operator' = 'operator'
  ) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Register into Firestore users collection
    const userDocId = trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const userRef = doc(db, 'users', userDocId);

    await setDoc(userRef, {
      email: trimmedEmail,
      password: pass,
      displayName: name,
      role: role,
      createdAt: new Date().toISOString(),
    });

    const authUser: AuthUser = {
      uid: userDocId,
      email: trimmedEmail,
      displayName: name,
    };
    const prof: UserProfile = {
      uid: userDocId,
      email: trimmedEmail,
      displayName: name,
      role: role,
    };

    setUser(authUser);
    setProfile(prof);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: authUser, profile: prof }));
    await checkAndSeedInitialData();
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginDemo = async (type: 'admin' | 'operator') => {
    const isAdm = type === 'admin';
    const email = isAdm ? 'admin@samudera-log.com' : 'operator@samudera-log.com';
    const displayName = isAdm ? 'Capt. Hendra Gunawan (Administrator)' : 'Bambang Suryono (Staf Operasional Pelabuhan)';

    const authUser: AuthUser = {
      uid: isAdm ? 'usr-admin-demo-01' : 'usr-operator-demo-02',
      email: email,
      displayName: displayName,
    };

    const prof: UserProfile = {
      uid: authUser.uid,
      email: email,
      displayName: displayName,
      role: isAdm ? 'admin' : 'operator',
    };

    // Save to Firestore and local session
    try {
      const userRef = doc(db, 'users', authUser.uid);
      await setDoc(
        userRef,
        {
          email,
          displayName,
          role: prof.role,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Silent note saving demo user:', e);
    }

    setUser(authUser);
    setProfile(prof);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: authUser, profile: prof }));
    await checkAndSeedInitialData();
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
