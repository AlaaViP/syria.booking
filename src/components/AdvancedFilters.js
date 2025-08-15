import React, { useEffect, useState } from 'react';

const provinces = [
  '', 'دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس',
  'درعا','السويداء','القنيطرة','إدلب','دير الزور','الرقة','الحسكة'
];
const types = ['شقة','منزل','استوديو','مكتب','فيلا','محل'];
const amenitiesList = ['تكييف','تدفئة','إنترنت','موقف','مصعد','مفروش'];

export default function AdvancedFilters({ value, onChange }) {
  // استدعاء الترجمة من داخل المكوّن فقط
  const { t } = require('react-i18next').useTranslation();

  const [local, setLocal] = useState({
    q:'', province:'', type:'', rooms:'', min:'', max:'', amenities:[]
  });

  useEffect(()=> {
    setLocal({ ...local, ...(value||{}) });
    // eslint-disable-next-line
  }, [value]);

  const setField = (k, v) => {
    const next = { ...local, [k]: v };
    setLocal(next);
    onChange?.(next);
  };

  const toggleAmenity = (am) => {
    const has = local.amenities?.includes(am);
    const next = has ? local.amenities.filter(x=>x!==am) : [ ...(local.amenities||[]), am ];
    setField('amenities', next);
  };

  const saveSearch = () => {
    const arr = JSON.parse(localStorage.getItem('saved_searches')||'[]');
    arr.unshift({ ...local, ts: Date.now() });
    localStorage.setItem('saved_searches', JSON.stringify(arr.slice(0,10)));
  };

  return (
    <div className="filters">
      <div className="row">
        <input
          className="input"
          value={local.q||''}
          onChange={e=>setField('q', e.target.value)}
          placeholder={t('search_placeholder')}
        />

        <select
          className="select"
          value={local.province||''}
          onChange={e=>setField('province', e.target.value)}
        >
          {provinces.map((p,i)=>(
            <option key={i} value={p}>{p || t('province')}</option>
          ))}
        </select>

        <select
          className="select"
          value={local.type||''}
          onChange={e=>setField('type', e.target.value)}
        >
          <option value="">{t('type')}</option>
          {types.map((n,i)=>(<option key={i} value={n}>{n}</option>))}
        </select>

        <input
          className="input" type="number" min="0"
          value={local.rooms||''}
          onChange={e=>setField('rooms', e.target.value)}
          placeholder={t('rooms')}
        />

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
          <input
            className="input" type="number" min="0"
            value={local.min||''}
            onChange={e=>setField('min', e.target.value)}
            placeholder={t('price_min')}
          />
          <input
            className="input" type="number" min="0"
            value={local.max||''}
            onChange={e=>setField('max', e.target.value)}
            placeholder={t('price_max')}
          />
        </div>
      </div>

      <div className="chips">
        {amenitiesList.map((am)=>(
          <button
            key={am}
            type="button"
            onClick={()=>toggleAmenity(am)}
            className={`chip ${local.amenities?.includes(am) ? 'active' : ''}`}
          >
            {am}
          </button>
        ))}
      </div>

      <div className="actions">
        <button type="button" className="btn btn-outline" onClick={saveSearch}>
          {t('save_search')}
        </button>
      </div>
    </div>
  );
}
