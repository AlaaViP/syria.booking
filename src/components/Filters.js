import React from 'react';
import { useTranslation } from 'react-i18next';
const provinces = ['','دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','درعا','السويداء','القنيطرة','إدلب','دير الزور','الرقة','الحسكة'];

export default function Filters({value, onChange}){
  const { t } = useTranslation();
  const set = (k,v)=>onChange({...value, [k]:v});
  return (
    <div className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
      <input value={value.q} onChange={e=>set('q', e.target.value)} placeholder={t('search_placeholder')} className="border rounded-xl px-3 py-3 w-full"/>
      <select value={value.province} onChange={e=>set('province', e.target.value)} className="border rounded-xl px-3 py-3">
        {provinces.map((p,i)=>(<option key={i} value={p}>{p||t('province')}</option>))}
      </select>
      <input type="number" min="0" value={value.rooms} onChange={e=>set('rooms', e.target.value)} placeholder={t('rooms')} className="border rounded-xl px-3 py-3"/>
      <input type="number" min="0" value={value.min} onChange={e=>set('min', e.target.value)} placeholder={t('price_range')+' (min)'} className="border rounded-xl px-3 py-3"/>
      <input type="number" min="0" value={value.max} onChange={e=>set('max', e.target.value)} placeholder={t('price_range')+' (max)'} className="border rounded-xl px-3 py-3"/>
    </div>
  );
}
