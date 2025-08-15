import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Login(){
  const { login } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');

  const submit = async (e)=>{
    e.preventDefault(); setErr('');
    try{ await login(email,password); nav('/'); }
    catch(e){ setErr(e.message); }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h2 className="text-2xl font-bold mb-4">{t('login')}</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-3 border rounded-xl" placeholder={t('email')} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input className="w-full p-3 border rounded-xl" placeholder={t('password')} type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full bg-green-700 text-white py-3 rounded-xl">{t('submit')}</button>
      </form>
      <div className="text-sm mt-3">
        {t('register')}؟ <Link to="/register" className="text-green-700 underline">{t('register')}</Link>
      </div>
    </div>
  );
}
