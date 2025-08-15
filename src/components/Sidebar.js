import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const provinces = ['دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','درعا','السويداء','القنيطرة','إدلب','دير الزور','الرقة','الحسكة'];

export default function Sidebar(){
  const nav = useNavigate();
  const { t } = useTranslation();
  const goProvince = (p) => nav(`/?province=${encodeURIComponent(p)}`);

  return (
    <aside className="sidebar">
      <button onClick={()=>nav('/login')} className="nav-btn">{t('login')}</button>
      <button onClick={()=>nav('/register')} className="nav-btn">{t('register')}</button>
      <button onClick={()=>nav('/add')} className="nav-btn">{t('add_property')}</button>
      <button onClick={()=>nav('/dashboard')} className="nav-btn">{t('dashboard')}</button>

      <h4>{t('provinces')}</h4>
      <div className="province-list">
        {provinces.map((p,i)=>(
          <button key={i} onClick={()=>goProvince(p)} className="province-btn">{p}</button>
        ))}
      </div>
    </aside>
  );
}
