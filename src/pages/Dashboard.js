import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  db, collection, onSnapshot, query, where, orderBy,
  updateBookingStatus
} from '../firebase';
import { useAuth } from '../context/AuthContext';

// تنسيق أرقام
const fmt = (n) => new Intl.NumberFormat('ar-SY').format(n || 0);
const PROVINCES = ['','دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','درعا','السويداء','القنيطرة','إدلب','دير الزور','الرقة','الحسكة'];
const TYPES = ['','شقة','منزل','استوديو','مكتب','فيلا','محل'];

export default function Dashboard() {
  const { user } = useAuth?.() || { user: null };
  const nav = useNavigate();

  // بيانات Firestore
  const [props, setProps] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);

  // فلاتر الجدول
  const [q, setQ] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState('');

  // المدة للرسم
  const [range, setRange] = useState(30); // 7 / 14 / 30

  // === اشتراكات Firestore ===
  useEffect(()=>{
    // properties لصاحب الحساب (إن وُجد)، وإلا الكل
    const propsRef = collection(db, 'properties');
    const propsQ = user ? query(propsRef, where('ownerId','==',user.uid), orderBy('createdAt','desc')) : query(propsRef, orderBy('createdAt','desc'));
    const unsubProps = onSnapshot(propsQ, snap => {
      setProps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // bookings حيث أنت المالك (ownerId) أو المستأجر (renterId)
    const bookRef = collection(db, 'bookings');
    let bookQ = query(bookRef, orderBy('createdAt','desc'));
    if (user) {
      // يمكنك تخصيصها لمالك الإعلان
      bookQ = query(bookRef, where('ownerId','==',user.uid), orderBy('createdAt','desc'));
    }
    const unsubBook = onSnapshot(bookQ, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // events آخر 30 يوم
    const evRef = collection(db, 'events');
    const unsubEv = onSnapshot(query(evRef, orderBy('ts','desc')), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data(), ts: d.data().ts?.toDate?.() || new Date() }));
      // أبقِ فقط آخر 30 يوم
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      setEvents(all.filter(e => e.ts >= cutoff));
    });

    return () => { unsubProps(); unsubBook(); unsubEv(); };
  },[user]);

  // إحصاءات أعلى
  const stats = useMemo(()=>{
    const views = events.filter(e => e.type === 'view');
    const books = events.filter(e => e.type === 'booking');
    return {
      total: props.length,
      views: views.length,
      bookings: books.length,
      pending: bookings.filter(b => b.status==='pending').length,
      approved: bookings.filter(b => b.status==='approved').length,
    };
  },[props, events, bookings]);

  // تجميع الرسم حسب اليوم
  const chartData = useMemo(()=>{
    const byDay = {};
    const refDate = new Date(); refDate.setDate(refDate.getDate()- (range-1));
    for (let i=0;i<range;i++){
      const d = new Date(refDate); d.setDate(refDate.getDate() + i);
      const k = d.toISOString().slice(0,10);
      byDay[k] = { date:k, views:0, bookings:0 };
    }
    events.forEach(e=>{
      const k = e.ts.toISOString().slice(0,10);
      if (byDay[k]) {
        if (e.type==='view') byDay[k].views++;
        if (e.type==='booking') byDay[k].bookings++;
      }
    });
    return Object.values(byDay);
  },[events, range]);

  // تطبيق الفلاتر على جدول الإعلانات
  const filteredProps = useMemo(()=>{
    return props.filter(p=>{
      const matchQ = q ? ((p.title||'').includes(q) || (p.description||'').includes(q)) : true;
      const matchProv = province ? p.province === province : true;
      const matchType = type ? p.type === type : true;
      return matchQ && matchProv && matchType;
    });
  },[props, q, province, type]);

  // أحدث 6 بعد الفلترة
  const recent = filteredProps.slice(0,6);

  return (
    <div className="container">
      <div className="dash__header">
        <h2>لوحة التحكم</h2>
        <div className="dash__quick">
          <button className="btn btn-primary" onClick={() => nav('/add')}>+ إضافة إعلان جديد</button>
          <Link className="btn btn-outline" to="/">الصفحة الرئيسية</Link>
        </div>
      </div>

      {/* بطاقات الإحصاءات */}
      <section className="dash__stats">
        <StatCard label="إجمالي الإعلانات" value={fmt(stats.total)} icon="📢" color="#166534" />
        <StatCard label="مشاهدات (آخر 30 يومًا)" value={fmt(stats.views)} icon="👀" color="#1d4ed8" />
        <StatCard label="طلبات الحجز" value={fmt(stats.bookings)} icon="📅" color="#7c3aed" />
        <StatCard label="قيد الانتظار" value={fmt(stats.pending)} icon="⏳" color="#b45309" />
        <StatCard label="المقبولة" value={fmt(stats.approved)} icon="✅" color="#0e7490" />
      </section>

      {/* الرسم البياني */}
      <section className="card dash__chart">
        <div className="dash__chart-head">
          <div>
            <h3>الأداء (مشاهدات/حجوزات)</h3>
            <p className="muted">مجمّع حسب اليوم خلال المدة المحددة.</p>
          </div>
          <div className="dash__range">
            <button className={`chip ${range===7?'active':''}`} onClick={()=>setRange(7)}>7 أيام</button>
            <button className={`chip ${range===14?'active':''}`} onClick={()=>setRange(14)}>14 يوم</button>
            <button className={`chip ${range===30?'active':''}`} onClick={()=>setRange(30)}>30 يوم</button>
          </div>
        </div>
        <MiniChart data={chartData} />
      </section>

      {/* فلاتر الجدول */}
      <section className="card" style={{padding:12, marginTop:12}}>
        <div className="table-filters">
          <input className="input" placeholder="بحث..." value={q} onChange={e=>setQ(e.target.value)} />
          <select className="select" value={province} onChange={e=>setProvince(e.target.value)}>
            {PROVINCES.map((p,i)=>(<option key={i} value={p}>{p || 'كل المحافظات'}</option>))}
          </select>
          <select className="select" value={type} onChange={e=>setType(e.target.value)}>
            {TYPES.map((t,i)=>(<option key={i} value={t}>{t || 'كل الأنواع'}</option>))}
          </select>
          <button className="btn btn-outline" onClick={()=>{setQ('');setProvince('');setType('');}}>إعادة ضبط</button>
        </div>
      </section>

      {/* إعلاناتي + حجوزاتي */}
      <section className="dash__grid2">
        <div className="card dash__panel">
          <div className="dash__panel-head">
            <h3>إعلاناتي</h3>
            <span className="muted">({filteredProps.length})</span>
          </div>

          <div className="table">
            <div className="table__head">
              <div>العنوان</div>
              <div>النوع</div>
              <div>المحافظة</div>
              <div>عرض</div>
              <div>إجراءات</div>
            </div>

            {recent.length === 0 ? (
              <div className="table__empty">لا توجد نتائج بحسب الفلاتر.</div>
            ) : (
              recent.map(p => (
                <div key={p.id} className="table__row">
                  <div className="table__cell">
                    <div className="table__title">{p.title || '—'}</div>
                    <div className="table__muted">{(p.description || '').slice(0, 60)}</div>
                  </div>
                  <div>{p.type || '—'}</div>
                  <div>{p.province || '—'}</div>
                  <div>{p.daily_price ? `$${p.daily_price}/يوم` :
                       p.weekly_price ? `$${p.weekly_price}/أسبوع` :
                       p.monthly_price ? `$${p.monthly_price}/شهر` : '—'}</div>
                  <div className="table__actions">
                    <Link to={`/property/${p.id}`} className="btn btn-mini">فتح</Link>
                    <button className="btn btn-mini" onClick={()=>alert('تحرير قريبًا')}>تحرير</button>
                    <button className="btn btn-mini danger" onClick={()=>alert('حذف قريبًا')}>حذف</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* إدارة الحجوزات */}
        <div className="card dash__panel">
          <div className="dash__panel-head">
            <h3>الحجوزات</h3>
            <span className="muted">({bookings.length})</span>
          </div>

          {bookings.length === 0 ? (
            <div className="table__empty">لا توجد حجوزات.</div>
          ) : (
            <div className="table">
              <div className="table__head">
                <div>العقار</div>
                <div>من → إلى</div>
                <div>الحالة</div>
                <div>إجراءات</div>
              </div>
              {bookings.map(b=>(
                <div key={b.id} className="table__row">
                  <div className="table__title">{b.propId}</div>
                  <div>{b.from} → {b.to}</div>
                  <div style={{fontWeight:700}}>
                    {b.status==='pending' && 'معلّق'}
                    {b.status==='approved' && 'مقبول'}
                    {b.status==='rejected' && 'مرفوض'}
                  </div>
                  <div className="table__actions">
                    <button className="btn btn-mini" onClick={()=>updateBookingStatus(b.id,'approved')}>قبول</button>
                    <button className="btn btn-mini danger" onClick={()=>updateBookingStatus(b.id,'rejected')}>رفض</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/** عنصر بطاقة إحصائية */
function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat">
      <div className="stat__icon" style={{ backgroundColor: color }}>{icon}</div>
      <div className="stat__meta">
        <div className="stat__label">{label}</div>
        <div className="stat__value">{value}</div>
      </div>
    </div>
  );
}

/** رسم SVG بسيط */
function MiniChart({ data }) {
  const W = 820, H = 240, P = 28;
  const maxViews = Math.max(...data.map(d => d.views), 1);
  const maxBookings = Math.max(...data.map(d => d.bookings), 1);

  const x = (i) => P + (i * (W - 2 * P)) / Math.max(1, data.length - 1);
  const y1 = (v) => H - P - (v / maxViews) * (H - 2 * P);
  const y2 = (v) => H - P - (v / maxBookings) * (H - 2 * P);
  const path = (vals, yFn) => vals.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yFn(d)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mini-chart">
      <g stroke="#e5e7eb" strokeWidth="1">
        <line x1={P} y1={H-P} x2={W-P} y2={H-P} />
        <line x1={P} y1={P} x2={P} y2={H-P} />
      </g>
      <path d={path(data.map(d=>d.views), y1)} fill="none" stroke="#1d4ed8" strokeWidth="2" />
      {data.map((d,i)=>(<circle key={i} cx={x(i)} cy={y1(d.views)} r="2.5" fill="#1d4ed8" />))}
      {data.map((d,i)=>(<rect key={`b${i}`} x={x(i)-3} width="6" y={y2(d.bookings)} height={(H-P)-y2(d.bookings)} fill="#16a34a" />))}
      <g transform={`translate(${W - 200}, ${P})`} fontSize="12">
        <rect width="190" height="40" rx="10" ry="10" fill="#fff" stroke="#e5e7eb"/>
        <g transform="translate(10,12)">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#1d4ed8" strokeWidth="2" />
          <text x="28" y="4">مشاهدات</text>
        </g>
        <g transform="translate(10,26)">
          <rect x="0" y="-6" width="20" height="12" fill="#16a34a"/>
          <text x="28" y="4">حجوزات</text>
        </g>
      </g>
    </svg>
  );
}
