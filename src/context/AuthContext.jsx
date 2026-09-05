import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, googleProvider, database } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if UID is listed in /admins/{uid}
  const checkAdminPrivilege = async (uid) => {
    if (!uid) return false;
    try {
      const adminRef = ref(database, `admins/${uid}`);
      const snapshot = await get(adminRef);
      return snapshot.exists() && Boolean(snapshot.val());
    } catch (err) {
      console.error('Error checking admin permissions:', err);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const adminStatus = await checkAdminPrivilege(currentUser.uid);
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Client Google Sign-In
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  // Admin Email/Password login with strict /admins/{uid} verification
  const adminLogin = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const isAuthorized = await checkAdminPrivilege(cred.user.uid);
      if (!isAuthorized) {
        // Sign out immediately if not listed in /admins node
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        const err = new Error('Access Denied: Your account does not have administrator privileges in TechTrix Esports.');
        err.code = 'auth/unauthorized-admin';
        throw err;
      }
      setUser(cred.user);
      setIsAdmin(true);
      return cred.user;
    } catch (error) {
      console.error('Admin Login failed:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginWithGoogle,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
