import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t, i18n } = useTranslation();
  const switchLang = (lng) => { if (i18n && typeof i18n.changeLanguage === 'function') i18n.changeLanguage(lng); };

  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <Link to="/" className="brand">{t('brand')}</Link>
        <nav className="actions">
          <Link to="/add" className="btn btn-primary">{t('add_property')}</Link>
          <Link to="/dashboard" className="btn btn-outline">{t('dashboard')}</Link>
          <Link to="/login" className="btn btn-outline">{t('login')}</Link>
          <Link to="/register" className="btn btn-outline">{t('register')}</Link>
          <div style={{display:'flex', gap:6}}>
            <button onClick={()=>switchLang('ar')} className="btn-lang">ع</button>
            <button onClick={()=>switchLang('en')} className="btn-lang">EN</button>
            <button onClick={()=>switchLang('tr')} className="btn-lang">TR</button>
            <button onClick={()=>switchLang('de')} className="btn-lang">DE</button>
          </div>
        </nav>
      </div>
    </header>
  );
}
