import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc, addEvent, addBooking, trackEvent } from '../firebase';
import { useAuth } from '../context/AuthContext';

// حمّل الخريطة Lazy حتى لا تكسر الصفحة على الإنتاج
const MapView = lazy(() => import('../components/MapView'));

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

  const images = Array.isArray(prop.images) ? prop.images : [];

  return (
    <div className="container">
      {/* بطاقة التفاصيل */}
      <div className="card" style={{ padding: 12 }}>
        <h2 style={{ margin: 0 }}>{prop.title}</h2>
        <div className="meta" style={{ color: '#6b7280', marginTop: 4 }}>
          {prop.province} • {prop.type} • 🛏 {prop.rooms || 0} • 📐 {prop.area || 0} م²
        </div>

        {/* صور */}
        <div className="preview-grid" style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {images.map((src, i) => (
            <div key={i} className="preview" style={{ overflow: 'hidden', borderRadius: 12, height: 140, background: '#f3f4f6' }}>
              {/* تأكد أن الروابط https علشان تعمل على Vercel */}
              <img src={src} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ))}
        </div>

        {/* الوصف */}
        <p style={{ marginTop: 10 }}>{prop.description}</p>

        {/* الخريطة (Lazy) */}
        <div style={{ marginTop: 12 }}>
          <Suspense fallback={<div style={{ height: 280 }} />}>
            <MapView lat={prop?.lat ?? 33.5138} lng={prop?.lng ?? 36.2765} zoom={12} />
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
