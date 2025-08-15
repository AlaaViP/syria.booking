import React, { useState } from 'react';

export default function PropertyCard({id, title, desc, price, unit, rooms, area, image, fav, onFav}){
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <img src={image} alt={title} className="w-full h-44 object-cover"/>
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onFav} title={fav?'إزالة من المفضلة':'أضف للمفضلة'}>{fav?'❤️':'🤍'}</button>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{desc}</p>
        <div className="flex items-center justify-between text-sm text-gray-700 pt-2">
          <span>🛏 {rooms} غرف</span>
          <span>📐 {area} م²</span>
          <span className="font-semibold text-green-700">${price}{unit}</span>
        </div>
        <button onClick={()=>setOpen(true)} className="mt-3 w-full bg-green-700 text-white py-2 rounded-lg">التفاصيل</button>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-[90%]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={()=>setOpen(false)}>✖</button>
            </div>
            <img src={image} alt={title} className="w-full h-56 object-cover rounded-xl mb-3"/>
            <p className="text-gray-700">{desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
