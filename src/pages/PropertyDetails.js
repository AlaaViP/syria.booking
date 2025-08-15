import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc, addEvent, addBooking, trackEvent } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function PropertyDetails(){
  const { id } = useParams();
  const { user } = useAuth();
  const [prop, setProp] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
const MapView = lazy(() => import('../components/MapView'));

  useEffect(()=>{
    (async ()=>{
      const snap = await getDoc(doc(db, 'properties', id));
      if (snap.exists()) setProp({ id: snap.id, ...snap.data() });

      // سجّل مشاهدة
      await addEvent({ type: 'view', propId: id, userId: user?.uid || null });
      trackEvent('view_property', { propId: id });
    })();
  },[id, user]);

  const submitBooking = async () => {
    if (!user) return alert('الرجاء تسجيل الدخول لإتمام الحجز.');
    if (!from || !to) return alert('حدد تاريخي البداية والنهاية');
    try {
      setBookingLoading(true);
      await addBooking({
        propId: id,
        ownerId: prop?.ownerId || null,
        renterId: user.uid,
        from, to, notes
      });
      await addEvent({ type: 'booking', propId: id, userId: user.uid });
      trackEvent('create_booking', { propId: id });
      alert('تم إرسال طلب الحجز (معلّق).');
      setFrom(''); setTo(''); setNotes('');
    } catch (e) {
      console.error(e);
      alert('تعذّر إرسال الحجز');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!prop) return <div className="container"><div className="card" style={{padding:12}}>جار التحميل…</div></div>;

  return (
    <div className="container">
      <div className="card" style={{padding:12}}>
        <h2>{prop.title}</h2>
        <div className="meta">{prop.province} • {prop.type} • 🛏 {prop.rooms||0} • 📐 {prop.area||0} م²</div>
        <div className="preview-grid" style={{marginTop:10}}>
          {(prop.images||[]).map((src,i)=>(
            <div key={i} className="preview"><img src={src} alt={`img-${i}`} /></div>
          ))}
        </div>
        <p style={{marginTop:10}}>{prop.description}</p>
      </div>

      <div className="card" style={{padding:12, marginTop:12}}>
        <h3>طلب حجز</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div><label>من</label><input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} /></div>
          <div><label>إلى</label><input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} /></div>
        </div>
        <div style={{marginTop:8}}>
          <label>ملاحظات</label>
          <textarea className="textarea" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
        <div style={{marginTop:10}}>
          <button className="btn btn-save" onClick={submitBooking} disabled={bookingLoading}>
            {bookingLoading ? 'يرسل…' : 'إرسال طلب الحجز'}
          </button>
        </div>
      </div>
    </div>
  );
}
