import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
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
        if (parsed.user && parsed.profile) {
          setUser(parsed.user);
          setProfile(parsed.profile);
          checkAndSeedInitialData().catch(console.error);
        }
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
      }
      setLoading(false);
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Email atau username wajib diisi.');
    if (!pass) throw new Error('Password wajib diisi.');

    const isAdmin =
      trimmedEmail.includes('admin') ||
      trimmedEmail === 'arizo4212@gmail.com';
    const displayName = trimmedEmail.split('@')[0] || (isAdmin ? 'Admin Maritim' : 'Operator Logistik');

    const authUser: AuthUser = {
      uid: 'usr_' + trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: trimmedEmail,
      displayName: displayName,
    };

    const prof: UserProfile = {
      uid: authUser.uid,
      email: trimmedEmail,
      displayName: displayName,
      role: isAdmin ? 'admin' : 'operator',
    };

    // Verify / persist in Firestore
    try {
      const userRef = doc(db, 'users', authUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.password && data.password !== pass) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
      } else {
        await setDoc(userRef, {
          email: trimmedEmail,
          password: pass,
          displayName,
          role: prof.role,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      if (err.message?.includes('Kata sandi yang Anda masukkan salah.')) {
        throw err;
      }
      console.warn('Firestore user auth sync note:', err.message);
    }

    setUser(authUser);
    setProfile(prof);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: authUser, profile: prof }));
    checkAndSeedInitialData().catch(console.error);
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    role: 'admin' | 'operator' = 'operator'
  ) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Email wajib diisi.');
    if (!name.trim()) throw new Error('Nama lengkap wajib diisi.');
    if (pass.length < 4) throw new Error('Password minimal 4 karakter.');

    const uid = 'usr_' + trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const authUser: AuthUser = {
      uid,
      email: trimmedEmail,
      displayName: name,
    };
    const prof: UserProfile = {
      uid,
      email: trimmedEmail,
      displayName: name,
      role,
    };

    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        email: trimmedEmail,
        password: pass,
        displayName: name,
        role,
        createdAt: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn('Firestore register note:', e.message);
    }

    setUser(authUser);
    setProfile(prof);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: authUser, profile: prof }));
    checkAndSeedInitialData().catch(console.error);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginDemo = async (type: 'admin' | 'operator') => {
    const isAdm = type === 'admin';
    const email = isAdm ? 'admin@samudera-log.com' : 'operator@samudera-log.com';
    const displayName = isAdm
      ? 'Capt. Hendra Gunawan (Administrator)'
      : 'Bambang Suryono (Staf Operasional Pelabuhan)';

    const authUser: AuthUser = {
      uid: isAdm ? 'demo-admin-01' : 'demo-operator-02',
      email: email,
      displayName: displayName,
    };

    const prof: UserProfile = {
      uid: authUser.uid,
      email: email,
      displayName: displayName,
      role: isAdm ? 'admin' : 'operator',
    };

    // Update state immediately so UI opens with 0 latency
    setUser(authUser);
    setProfile(prof);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: authUser, profile: prof }));

    // Background sync
    try {
      const userRef = doc(db, 'users', authUser.uid);
      setDoc(
        userRef,
        {
          email,
          displayName,
          role: prof.role,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } catch {}

    checkAndSeedInitialData().catch(console.error);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
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
