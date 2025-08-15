import React, { useEffect, useState } from 'react';

export default function MapView({ lat = 33.5138, lng = 36.2765, zoom = 12 }) {
  const [L, setL] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (async () => {
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
      setL(leaflet);
    })();
  }, []);

  useEffect(() => {
    if (!L) return;
    const el = document.getElementById('sge-map');
    if (!el) return;
    const map = L.map(el).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map);
    return () => map.remove();
  }, [L, lat, lng, zoom]);

  return <div id="sge-map" style={{height:280, width:'100%', borderRadius:12, overflow:'hidden'}} />;
}
