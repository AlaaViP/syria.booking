// src/pages/Register.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { signup } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await signup(name, email, password); // ✅ بدل register → signup
      nav('/');
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h2 className="text-2xl font-bold mb-4">{t('register')}</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full p-3 border rounded-xl"
          placeholder={t('full_name')}
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="w-full p-3 border rounded-xl"
          placeholder={t('email')}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-3 border rounded-xl"
          placeholder={t('password')}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full bg-green-700 text-white py-3 rounded-xl">
          {t('submit')}
        </button>
      </form>
      <div className="text-sm mt-3">
        {t('login')}؟{' '}
        <Link to="/login" className="text-green-700 underline">
          {t('login')}
        </Link>
      </div>
    </div>
  );
}
