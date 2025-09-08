import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db, collection, onSnapshot, orderBy, query } from '../firebase';

const TYPES = ['شقة','منزل','استوديو','مكتب','فيلا','محل'];
const PROVINCES = ['دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','درعا','السويداء','القنيطرة','إدلب','دير الزور','الرقة','الحسكة'];

// خيارات الضيوف
const ADULTS_OPTS = Array.from({ length: 8 }, (_, i) => i + 1); // 1..8 بالغ
const CHILD_OPTS  = Array.from({ length: 9 }, (_, i) => i);     // 0..8 طفل

export default function Home(){
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const provinceParam = urlParams.get('province') || '';

  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [province, setProvince] = useState(provinceParam);
  const [type, setType] = useState('');

  // حقول جديدة
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  useEffect(()=>{
    const ref = collection(db, 'properties');
    const qy = query(ref, orderBy('createdAt','desc'));
    const unsub = onSnapshot(qy, snap => {
      setItems(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    });
    return () => unsub();
  },[]);

  useEffect(()=>{ setProvince(provinceParam); },[provinceParam]);

  const filtered = useMemo(()=>{
    return items.filter(p=>{
      // نص
      const matchQ =
        q ? ((p.title||'').includes(q) || (p.description||'').includes(q)) : true;

      // محافظة/نوع
      const matchProv = province ? p.province === province : true;
      const matchType = type ? p.type === type : true;

      // سعة الضيوف (فلترة مرنة: لو الحقول غير موجودة لا نستبعد)
      // دعم ثلاث صيغ:
      //  - guestsAdults / guestsChildren
      //  - guestsMax (إجمالي)
      //  - لا شيء → لا فلترة
      const haveSplit =
        typeof p.guestsAdults === 'number' || typeof p.guestsChildren === 'number';
      const haveTotal = typeof p.guestsMax === 'number';

      let matchGuests = true;
      if (haveSplit) {
        const a = typeof p.guestsAdults === 'number' ? p.guestsAdults : Infinity;
        const c = typeof p.guestsChildren === 'number' ? p.guestsChildren : Infinity;
        matchGuests = a >= adults && c >= children;
      } else if (haveTotal) {
        matchGuests = p.guestsMax >= (adults + children);
      }
      return matchQ && matchProv && matchType && matchGuests;
    });
  },[items, q, province, type, adults, children]);

  // صورة احتياطية ثابتة (ضع ملفاً محلياً في public/images/placeholder.jpg أو استعمل هذا الرابط الثابت)
  const FALLBACK_IMG = '/images/placeholder.jpg';

  return (
    <div className="container">
      {/* فلاتر البحث */}
      <div className="filters" style={{ marginTop: 8 }}>
        <div className="row">
          {/* البحث النصي */}
          <input
            className="input"
            placeholder="ابحث..."
            value={q}
            onChange={e=>setQ(e.target.value)}
          />

          {/* المحافظة */}
          <select className="select" value={province} onChange={e=>setProvince(e.target.value)}>
            <option value="">كل المحافظات</option>
            {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
          </select>

          {/* النوع */}
          <select className="select" value={type} onChange={e=>setType(e.target.value)}>
            <option value="">كل الأنواع</option>
            {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>

          {/* عدد البالغين */}
          <select className="select" value={adults} onChange={e=>setAdults(Number(e.target.value))}>
            {ADULTS_OPTS.map(n => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'بالغ' : 'بالغين'}
              </option>
            ))}
          </select>

          {/* عدد الأطفال */}
          <select className="select" value={children} onChange={e=>setChildren(Number(e.target.value))}>
            {CHILD_OPTS.map(n => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'طفل' : 'أطفال'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* بطاقات العقارات */}
      <div className="grid-cards">
        {filtered.map(p=>(
          <Link
            key={p.id}
            to={`/property/${p.id}`}
            className="property-card card"
            style={{textDecoration:'none', color:'inherit'}}
          >
            <img
              src={p.images?.[0] || FALLBACK_IMG}
              alt={p.title || 'عقار'}
              onError={(e)=>{ e.currentTarget.src = FALLBACK_IMG; }}
            />
            <div className="body">
              <h3 className="title">{p.title}</h3>
              <div className="meta">{p.province} • {p.type}</div>

              <div className="meta" style={{marginTop:8, display:'flex', gap:14}}>
                <span>🛏 {p.rooms||0}</span>
                <span>📐 {p.area||0} م²</span>
                {/* عرض السعة إن وُجدت */}
                {typeof p.guestsMax === 'number' && <span>👥 حتى {p.guestsMax} ضيف</span>}
                {(typeof p.guestsAdults === 'number' || typeof p.guestsChildren === 'number') && (
                  <span>👨‍👩‍👧‍👦 {p.guestsAdults ?? '-'} بالغ / {p.guestsChildren ?? '-'} طفل</span>
                )}
              </div>

              <div className="cta">
                <button className="btn-view">التفاصيل</button>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length===0 && (
          <div style={{gridColumn:'1 / -1', textAlign:'center', color:'#6b7280'}}>
            لا نتائج.
          </div>
        )}
      </div>
    </div>
  );
}
