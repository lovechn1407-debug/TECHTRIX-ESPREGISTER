import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('techtrix_admin_auth') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // If user logged in with password or previously authenticated as admin
        const isPasswordProvider = currentUser.providerData?.some(
          (p) => p.providerId === 'password'
        );
        const storedAdmin = localStorage.getItem('techtrix_admin_auth') === 'true';
        if (isPasswordProvider || storedAdmin) {
          setIsAdmin(true);
          localStorage.setItem('techtrix_admin_auth', 'true');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('techtrix_admin_auth');
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

  // Admin Email/Password login: any valid user in Firebase Authentication is an admin
  const adminLogin = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
      setIsAdmin(true);
      localStorage.setItem('techtrix_admin_auth', 'true');
      return cred.user;
    } catch (error) {
      console.error('Admin Login failed:', error);
      throw error;
    }
  };

  // Admin Google Sign-In option: signing in through admin portal confirms admin
  const adminGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setIsAdmin(true);
      localStorage.setItem('techtrix_admin_auth', 'true');
      return result.user;
    } catch (error) {
      console.error('Admin Google Login failed:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      localStorage.removeItem('techtrix_admin_auth');
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
        adminGoogleLogin,
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
