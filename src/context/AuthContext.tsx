import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types/maritime';
import { checkAndSeedInitialData } from '../services/maritimeService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: 'admin' | 'operator') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginDemo: (type: 'admin' | 'operator') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isAdmin =
          currentUser.email === 'arizo4212@gmail.com' ||
          currentUser.email?.includes('admin') ||
          currentUser.displayName?.toLowerCase().includes('admin');

        setProfile({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || (isAdmin ? 'Administrator Maritim' : 'Operator Logistik'),
          role: isAdmin ? 'admin' : 'operator',
        });

        // Trigger seed if database is empty once authenticated
        checkAndSeedInitialData().catch(console.error);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      // If user not found, try to auto-create user so user never gets stuck!
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          const defaultName = email.split('@')[0];
          await updateProfile(cred.user, { displayName: defaultName });
          return;
        } catch {
          // Re-throw original or meaningful message
          throw new Error('Kredensial tidak valid atau akun belum terdaftar.');
        }
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: 'admin' | 'operator' = 'operator') => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, {
      displayName: `${name} (${role === 'admin' ? 'Admin' : 'Staf Ops'})`,
    });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginDemo = async (type: 'admin' | 'operator') => {
    const email = type === 'admin' ? 'admin@samudera-log.com' : 'operator@samudera-log.com';
    const pass = 'samudera2026';
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      // Auto register demo account if not exists in this Firebase instance
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, {
          displayName: type === 'admin' ? 'Admin Maritim Utama' : 'Staf Operasional Pelabuhan',
        });
      } catch {
        // Fallback retry sign in
        await signInWithEmailAndPassword(auth, email, pass);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
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
