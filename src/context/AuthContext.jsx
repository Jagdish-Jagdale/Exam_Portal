import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          // Do not auto-create user doc on auth state change
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async ({ email, password, name }) => {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      try { await updateProfile(u, { displayName: name }); } catch {}
    }
    const ref = doc(db, 'users', u.uid);
    const userDoc = {
      uid: u.uid,
      email,
      role: 'user', // default role
      displayName: name || '',
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, userDoc, { merge: true });
    setProfile(userDoc);
    return u;
  };

  const login = async ({ email, password }) => {
    const { user: u } = await signInWithEmailAndPassword(auth, email, password);
    // Do not create user doc on login
    return u;
  };

  const logout = () => signOut(auth);

  const value = { user, profile, loading, signup, login, logout };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
