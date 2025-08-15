import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '../firebase';

const Ctx = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // راقب حالة تسجيل الدخول
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // تسجيل الدخول
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // إنشاء حساب + اسم العرض اختياري
  const register = async (name, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res?.user && name) {
      await updateProfile(res.user, { displayName: name });
    }
    return res;
  };

  // تسجيل الخروج
  const logout = () => signOut(auth);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}
