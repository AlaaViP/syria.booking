// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const changeLang = (lng) => {
    try { i18n.changeLanguage(lng); } catch {}
  };

  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <Link to="/" className="brand">Syria Golden Eagle</Link>

        <div className="actions">
          {/* لغة */}
          <div className="btn-group" style={{ display:'flex', gap:6 }}>
            <button className="btn-lang" onClick={() => changeLang('ar')}>ع</button>
            <button className="btn-lang" onClick={() => changeLang('en')}>EN</button>
            <button className="btn-lang" onClick={() => changeLang('tr')}>TR</button>
            <button className="btn-lang" onClick={() => changeLang('de')}>DE</button>
          </div>

          {/* روابط رئيسية */}
          <Link className="btn btn-outline" to="/add">{t('add_property') || 'إضافة عقار'}</Link>
          <Link className="btn btn-outline" to="/">{t('browse') || 'تصفح'}</Link>

          {/* حساب المستخدم */}
          {user ? (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                {t('dashboard') || 'لوحة التحكم'}
              </button>
              <button className="btn btn-outline" onClick={logout}>
                {t('logout') || 'خروج'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                {t('login') || 'دخول'}
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/register')}>
                {t('register') || 'إنشاء حساب'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
