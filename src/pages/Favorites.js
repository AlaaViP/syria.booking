import React, { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';

export default function Favorites(){
  const [fav,setFav]=useState([]);
  useEffect(()=>{ try { setFav(JSON.parse(localStorage.getItem('fav')||'[]')); } catch {} },[]);
  const all = [
    { id:1, title:'شقة مفروشة - المزة', desc:'قريبة من الخدمات', price:250, unit:'/أسبوع', rooms:3, area:120, province:'دمشق', image:'https://images.unsplash.com/photo-1505692794403-34cb4d2d9600?q=80&w=1200&auto=format&fit=crop' },
    { id:2, title:'مكتب حديث - الأمويين', desc:'مناسب للشركات', price:600, unit:'/شهر', rooms:2, area:80, province:'دمشق', image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop' },
    { id:3, title:'منزل عائلي - حلب', desc:'حي هادئ', price:50, unit:'/يوم', rooms:4, area:140, province:'حلب', image:'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop' }
  ];
  const data = all.filter(x=>fav.includes(x.id));
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">المفضلة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(p=>(<PropertyCard key={p.id} {...p} fav={true} onFav={()=>{}}/>))}
        {data.length===0 && <div className="col-span-full text-gray-500 text-center">لا توجد عناصر</div>}
      </div>
    </div>
  );
}
