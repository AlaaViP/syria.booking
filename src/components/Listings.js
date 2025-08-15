import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const sample = [
  { id:'demo2', title:'مكتب حديث - الأمويين', desc:'مناسب للشركات', price:600, unit:'/شهر', rooms:2, area:80, province:'دمشق', image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop' },
  { id:'demo1', title:'شقة مفروشة - المزة', desc:'قريبة من الخدمات', price:250, unit:'/أسبوع', rooms:3, area:120, province:'دمشق', image:'https://images.unsplash.com/photo-1505692794403-34cb4d2d9600?q=80&w=1200&auto=format&fit=crop' },
  { id:'demo3', title:'منزل عائلي - حلب', desc:'حي هادئ', price:50, unit:'/يوم', rooms:4, area:140, province:'حلب', image:'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop' },
];

export default function Listings({ filters }){
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState(()=>{ try { return JSON.parse(localStorage.getItem('fav')||'[]'); } catch { return []; }});
  const toggleFav = (id) => {
    const next = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites, id];
    setFavorites(next); localStorage.setItem('fav', JSON.stringify(next));
  };

  const data = useMemo(()=>{
    return sample.filter(item=>{
      if (filters?.q && !item.title.includes(filters.q) && !item.desc.includes(filters.q)) return false;
      if (filters?.province && item.province !== filters.province) return false;
      if (filters?.type && !item.title.includes(filters.type)) return false;
      if (filters?.rooms && item.rooms < Number(filters.rooms)) return false;
      if (filters?.min && item.price < Number(filters.min)) return false;
      if (filters?.max && item.price > Number(filters.max)) return false;
      return true;
    });
  },[filters]);

  return (
    <div className="grid-cards">
      {data.map(p => (
        <Link key={p.id} to={`/property/${p.id}`} className="property-card card" style={{textDecoration:'none', color:'inherit'}}>
          <img src={p.image} alt={p.title}/>
          <div className="body">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3 className="title">{p.title}</h3>
              <button onClick={(e)=>{ e.preventDefault(); toggleFav(p.id); }} title="Fav" className="btn btn-outline">♡</button>
            </div>
            <div className="meta">{p.desc}</div>
            <div className="meta" style={{marginTop:8}}>
              <span>🛏 {p.rooms} {t('beds')}</span>
              <span>📐 {p.area} {t('area_m2')}</span>
            </div>
            <div className="cta">
              <button className="btn-view">{t('details')}</button>
            </div>
          </div>
        </Link>
      ))}
      {data.length===0 && <div style={{gridColumn:'1 / -1', textAlign:'center', color:'#6b7280'}}>{t('no_results')}</div>}
    </div>
  );
}
