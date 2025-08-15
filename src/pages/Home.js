import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db, collection, onSnapshot, orderBy, query } from '../firebase';

const TYPES = ['شقة','منزل','استوديو','مكتب','فيلا','محل'];
const PROVINCES = ['دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','درعا','السويداء','القنيطرة','إدلب','دير الزور','الرقة','الحسكة'];

export default function Home(){
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const provinceParam = urlParams.get('province') || '';

  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [province, setProvince] = useState(provinceParam);
  const [type, setType] = useState('');

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
      const matchQ = q ? ((p.title||'').includes(q) || (p.description||'').includes(q)) : true;
      const matchProv = province ? p.province === province : true;
      const matchType = type ? p.type === type : true;
      return matchQ && matchProv && matchType;
    });
  },[items, q, province, type]);

  return (
    <div className="container">
      {/* فلاتر بسيطة أعلى الصفحة */}
      <div className="filters" style={{marginTop: 8}}>
        <div className="row">
          <input className="input" placeholder="ابحث..." value={q} onChange={e=>setQ(e.target.value)} />
          <select className="select" value={province} onChange={e=>setProvince(e.target.value)}>
            <option value="">كل المحافظات</option>
            {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <select className="select" value={type} onChange={e=>setType(e.target.value)}>
            <option value="">كل الأنواع</option>
            {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <div />
          <div />
        </div>
      </div>

      {/* بطاقات العقارات */}
      <div className="grid-cards">
        {filtered.map(p=>(
          <Link key={p.id} to={`/property/${p.id}`} className="property-card card" style={{textDecoration:'none', color:'inherit'}}>
            <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1505692794403-34cb4d2d9600?q=80&w=1200&auto=format&fit=crop'} alt={p.title}/>
            <div className="body">
              <h3 className="title">{p.title}</h3>
              <div className="meta">{p.province} • {p.type}</div>
              <div className="meta" style={{marginTop:8}}>
                <span>🛏 {p.rooms||0}</span>
                <span>📐 {p.area||0} م²</span>
              </div>
              <div className="cta">
                <button className="btn-view">التفاصيل</button>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length===0 && <div style={{gridColumn:'1 / -1', textAlign:'center', color:'#6b7280'}}>لا نتائج.</div>}
      </div>
    </div>
  );
}
