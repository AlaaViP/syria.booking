import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc, addEvent, addBooking, trackEvent } from '../firebase';
import { useAuth } from '../context/AuthContext';

// تحميل الخريطة Lazy
const MapView = lazy(() => import('../components/MapView'));

const FALLBACK_IMG = 'https://placehold.co/640x360?text=No+Image';
const DAMASCUS = { lat: 33.5138, lng: 36.2765 };

// تسميات المزايا
const AMENITY_LABELS = {
  ac: 'تكييف',
  elevator: 'مصعد',
  parking: 'موقف',
  wifi: 'إنترنت',
  furnished: 'مفروشة',
  kitchen: 'مطبخ',
  bathroom: 'حمّام',
  balcony: 'بلكون',
  pool: 'مسبح',
  indoorPool: 'مسبح داخلي',
  sauna: 'ساونا',
  jacuzzi: 'جاكوزي',
  playground: 'ملعب',
  garden: 'حديقة',
  terrace: 'تراس',
};

function formatPrice(prices = {}) {
  const { day, week, month } = prices;
  if (day != null)  return `$${day} / يوم`;
  if (week != null) return `$${week} / أسبوع`;
  if (month != null) return `$${month} / شهر`;
  return '—';
}

function getLatLng(p) {
  // أولوية: location.lat/lng -> lat/lng مباشر -> دمشق
  if (p?.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number') {
    return { lat: p.location.lat, lng: p.location.lng };
  }
  if (typeof p?.lat === 'number' && typeof p?.lng === 'number') {
    return { lat: p.lat, lng: p.lng };
  }
  return DAMASCUS;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [prop, setProp] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'properties', id));
        if (!mounted) return;
        if (snap.exists()) {
          setProp({ id: snap.id, ...snap.data() });
        }
        // سجل مشاهدة
        await addEvent({ type: 'view', propId: id, userId: user?.uid || null });
        trackEvent('view_property', { propId: id });
      } catch (e) {
        console.error('load property error:', e);
      }
    })();
    return () => { mounted = false; };
  }, [id, user]);

  const submitBooking = async () => {
    if (!user) return alert('الرجاء تسجيل الدخول لإتمام الحجز.');
    if (!from || !to) return alert('حدد تاريخي البداية والنهاية.');
    if (new Date(from) > new Date(to)) return alert('تاريخ البداية يجب أن يكون قبل تاريخ النهاية.');

    try {
      setBookingLoading(true);
      await addBooking({
        propId: id,
        ownerId: prop?.ownerId || null,
        renterId: user.uid,
        from,
        to,
        notes
      });
      await addEvent({ type: 'booking', propId: id, userId: user.uid });
      trackEvent('create_booking', { propId: id });
      alert('تم إرسال طلب الحجز (معلّق).');
      setFrom(''); setTo(''); setNotes('');
    } catch (e) {
      console.error('booking error:', e);
      alert('تعذّر إرسال الحجز.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!prop) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 12 }}>جارِ التحميل…</div>
      </div>
    );
  }

  const images = Array.isArray(prop.images) && prop.images.length ? prop.images : [FALLBACK_IMG];
  const loc = getLatLng(prop);

  const amenList = useMemo(() => {
    const a = prop.amenities || {};
    return Object.entries(a)
      .filter(([, val]) => !!val)
      .map(([k]) => AMENITY_LABELS[k] || k);
  }, [prop.amenities]);

  const cap = prop.capacity || {};
  const capLine = [
    Number.isFinite(cap.total) ? `سعة: ${cap.total}` : null,
    Number.isFinite(cap.adults) ? `بالغون: ${cap.adults}` : null,
    Number.isFinite(cap.minors) ? `قاصرون: ${cap.minors}` : null,
  ].filter(Boolean).join(' • ');

  return (
    <div className="container">
      {/* بطاقة التفاصيل */}
      <div className="card" style={{ padding: 12 }}>
        <h2 style={{ margin: 0 }}>{prop.title || 'بدون عنوان'}</h2>

        <div className="meta" style={{ color: '#6b7280', marginTop: 4 }}>
          {prop.province || ''}{prop.type ? ` • ${prop.type}` : ''}{' '}
          {Number.isFinite(prop.rooms) ? ` • 🛏 ${prop.rooms}` : ''}{' '}
          {Number.isFinite(prop.area) ? ` • 📐 ${prop.area} م²` : ''}
          {capLine ? ` • ${capLine}` : ''}
        </div>

        {/* الأسعار */}
        <div style={{ marginTop: 6, fontWeight: 700 }}>{formatPrice(prop.prices)}</div>

        {/* صور */}
        <div
          className="preview-grid"
          style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="preview"
              style={{ overflow: 'hidden', borderRadius: 12, height: 140, background: '#f3f4f6' }}
            >
              <img
                src={src}
                alt={`img-${i}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
              />
            </div>
          ))}
        </div>

        {/* المزايا */}
        {amenList.length > 0 && (
          <div style={{ marginTop: 10, color: '#111827' }}>
            <strong>المزايا:</strong> {amenList.join(' • ')}
          </div>
        )}

        {/* الوصف */}
        {prop.description && <p style={{ marginTop: 10 }}>{prop.description}</p>}

        {/* الخريطة (Lazy) */}
        <div style={{ marginTop: 12 }}>
          <Suspense fallback={<div style={{ height: 280 }} />}>
            <MapView lat={loc.lat} lng={loc.lng} zoom={12} />
          </Suspense>
        </div>
      </div>

      {/* طلب حجز */}
      <div className="card" style={{ padding: 12, marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>طلب حجز</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>من</label>
            <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label>إلى</label>
            <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>ملاحظات</label>
          <textarea className="textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div style={{ marginTop: 10 }}>
          <button className="btn btn-save" onClick={submitBooking} disabled={bookingLoading}>
            {bookingLoading ? 'يرسل…' : 'إرسال طلب الحجز'}
          </button>
        </div>
      </div>
    </div>
  );
}
