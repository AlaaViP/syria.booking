import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  db, addDoc, collection, serverTimestamp, trackEvent, addEvent,
} from '../firebase';

const PROVINCES = [
  'دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','درعا','السويداء','القنيطرة','إدلب','دير الزور','الرقة','الحسكة'
];

const TYPES = ['شقة','منزل','مكتب','غرفة','استوديو','فيلا','أرض','محل'];

/* ======= المزايا الموسّعة ======= */
const AMENITIES = [
  {key:'ac', label:'تكييف'},
  {key:'elevator', label:'مصعد'},
  {key:'parking', label:'موقف'},
  {key:'wifi', label:'إنترنت'},
  {key:'furnished', label:'مفروشة'},
  {key:'kitchen', label:'مطبخ'},
  {key:'bathroom', label:'حمّام'},
  {key:'balcony', label:'بلكون'},
  {key:'pool', label:'مسبح'},
  {key:'indoorPool', label:'مسبح داخلي'},
  {key:'sauna', label:'ساونا'},
  {key:'jacuzzi', label:'جاكوزي'},
  {key:'playground', label:'ملعب'},
  {key:'garden', label:'حديقة'},
  {key:'terrace', label:'تراس'},
];

/* ===================== Geocoding (Nominatim) ===================== */
const buildFullAddress = (address, province) =>
  [address, province, 'Syria'].filter(Boolean).join(', ');

async function geocodeAddress(q) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=0&countrycodes=sy&accept-language=ar&q=${encodeURIComponent(q)}`;

  const resp = await fetch(url, {
    headers: {
      'Accept-Language': 'ar',
      'User-Agent': 'SyriaGoldenEagle/1.0 (contact: youremail@example.com)',
    },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (Array.isArray(data) && data.length) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}
/* ================================================================= */

/** حقل نصي */
const Field = ({ label, children, required }) => (
  <label className="ap-field">
    <div className="ap-label">
      {label} {required && <span className="ap-req">*</span>}
    </div>
    {children}
  </label>
);

/** شارة خيار */
const Chip = ({ active, onClick, children }) => (
  <button type="button" className={`ap-chip ${active ? 'is-active' : ''}`} onClick={onClick}>
    {children}
  </button>
);

/** مدخل روابط الصور + معاينة محلية للملفات */
const ImagesInput = ({ urls, setUrls, files, setFiles }) => {
  const [text, setText] = useState(urls.join(', '));

  useEffect(() => setText(urls.join(', ')), [urls]);

  const previews = useMemo(() => {
    const arr = [];
    for (const f of files) {
      arr.push({ src: URL.createObjectURL(f), name: f.name, local: true });
    }
    urls.forEach(u => arr.push({ src: u, name: u }));
    return arr;
  }, [files, urls]);

  const onPick = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list.slice(0, 10)); // حد أعلى 10
  };

  const applyUrls = () => {
    const list = text.split(',').map(s => s.trim()).filter(Boolean);
    setUrls(list.slice(0, 20));
    toast.success('تم تحديث روابط الصور');
  };

  return (
    <div className="ap-images">
      <div className="ap-images-row">
        <input type="file" accept="image/*" multiple onChange={onPick} className="ap-file" />
        <small className="ap-hint">
          يمكنك اختيار صور من جهازك (للمعاينة فقط) + إضافة روابط صور جاهزة. الرفع إلى التخزين غير مفعّل حاليًا.
        </small>
      </div>

      <div className="ap-images-row">
        <textarea
          className="input ap-urlbox"
          rows={3}
          placeholder="ألصق روابط صور مفصولة بفاصلة ,"
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <button type="button" className="btn ap-apply" onClick={applyUrls}>تطبيق الروابط</button>
      </div>

      {previews.length > 0 && (
        <div className="ap-grid">
          {previews.map((p, i)=>(
            <div key={i} className="ap-thumb">
              <img src={p.src} alt={p.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AddProperty(){
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState('');
  const [rooms, setRooms] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [desc, setDesc] = useState('');

  // نبني الحالة الابتدائية للمزايا من القائمة أعلاه
  const defaultAmen = useMemo(() => AMENITIES.reduce((acc, a)=> (acc[a.key]=false, acc), {}), []);
  const [amen, setAmen] = useState(defaultAmen);

  // الأسعار
  const [priceDay, setPriceDay] = useState('');
  const [priceWeek, setPriceWeek] = useState('');
  const [priceMonth, setPriceMonth] = useState('');

  // السعة (أشخاص)
  const [capTotal, setCapTotal] = useState('');   // الكلي
  const [capAdults, setCapAdults] = useState(''); // بالغون
  const [capMinors, setCapMinors] = useState(''); // قاصرون

  const [imageUrls, setImageUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    if (!user) {
      toast('الرجاء تسجيل الدخول أولاً');
      navigate('/login');
    }
  },[user, navigate]);

  const toggleAmen = (k) => setAmen(prev => ({...prev, [k]: !prev[k]}));

  const validate = () => {
    if (!title.trim()) return 'أدخل عنوانًا مناسبًا';
    if (!province) return 'اختر المحافظة';
    if (!type) return 'اختر نوع العقار';
    if (!rooms) return 'أدخل عدد الغرف';
    if (Number(rooms) < 0) return 'عدد الغرف غير صحيح';
    if (!area) return 'أدخل المساحة';
    if (!address.trim()) return 'أدخل العنوان التفصيلي (الحي/الشارع)';
    if (!priceDay && !priceWeek && !priceMonth) return 'أدخل سعرًا واحدًا على الأقل (يومي/أسبوعي/شهري)';
    // السعة اختيارية، لكن إن أدخل بالغين/قاصرين بدون الكلي، سنحسبه تلقائيًا
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    try {
      setSaving(true);

      // 1) تحديد الإحداثيات
      const q = buildFullAddress(address, province);
      const coords = await geocodeAddress(q);
      if (!coords) {
        setSaving(false);
        toast.error('تعذّر تحديد موقع العنوان تلقائيًا. عدّل العنوان أو جرّب بشكل أدق.');
        return;
      }

      // 2) تجهيز السعة
      const adultsNum = capAdults ? Number(capAdults) : 0;
      const minorsNum = capMinors ? Number(capMinors) : 0;
      const totalNum = capTotal ? Number(capTotal) : (adultsNum + minorsNum);
      const capacity = {
        total: totalNum || null,
        adults: capAdults ? adultsNum : null,
        minors: capMinors ? minorsNum : null,
      };

      // 3) البيانات النهائية
      const data = {
        ownerId: user.uid,
        title: title.trim(),
        province, type,
        rooms: Number(rooms),
        area: Number(area),
        address: address.trim(),
        description: desc.trim(),
        amenities: amen,
        capacity, // << السعة
        prices: {
          day: priceDay ? Number(priceDay) : null,
          week: priceWeek ? Number(priceWeek) : null,
          month: priceMonth ? Number(priceMonth) : null,
        },
        images: imageUrls,
        location: { lat: coords.lat, lng: coords.lng },
        createdAt: serverTimestamp(),
        status: 'active',
      };

      const col = collection(db, 'properties');
      const docRef = await addDoc(col, data);

      await addEvent({ type:'add_property', propId: docRef.id, userId: user.uid });
      trackEvent('add_property', { propId: docRef.id });

      toast.success('تم إضافة العقار بنجاح');
      navigate(`/property/${docRef.id}`);
    } catch (e2) {
      console.error(e2);
      toast.error('تعذّر حفظ العقار');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <form className="ap-card" onSubmit={onSubmit} id="add-property-form">
        <div className="ap-head">
          <h2>إضافة عقار</h2>
          <p className="ap-sub">املأ الحقول التالية بدقة لتحسين ظهور إعلانك.</p>
        </div>

        <div className="ap-grid2">
          <Field label="العنوان" required>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="مثال: شقة مفروشة - المزة" />
          </Field>

          <Field label="المحافظة" required>
            <select className="select" value={province} onChange={e=>setProvince(e.target.value)}>
              <option value="">اختر…</option>
              {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="نوع العقار" required>
            <div className="ap-chips">
              {TYPES.map(tp=>(
                <Chip key={tp} active={type===tp} onClick={()=>setType(tp)}>{tp}</Chip>
              ))}
            </div>
          </Field>

          <Field label="عدد الغرف" required>
            <input className="input" type="number" min="0" value={rooms} onChange={e=>setRooms(e.target.value)} placeholder="مثال: 2" />
          </Field>

          <Field label="المساحة (م²)" required>
            <input className="input" type="number" min="0" value={area} onChange={e=>setArea(e.target.value)} placeholder="مثال: 120" />
          </Field>

          <Field label="العنوان التفصيلي" required>
            <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="مثال: المزة – فيلات شرقية" />
          </Field>

          <Field label="وصف العقار">
            <textarea className="input" rows={4} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="اكتب وصفًا مختصرًا عن العقار والمزايا القريبة…" />
          </Field>
        </div>

        {/* ======= السعة (عدد الأشخاص) ======= */}
        <div className="ap-grid3">
          <Field label="السعة الكلّية (عدد الأشخاص)">
            <input className="input" type="number" min="0" value={capTotal} onChange={e=>setCapTotal(e.target.value)} placeholder="مثال: 4" />
          </Field>
          <Field label="عدد البالغين">
            <input className="input" type="number" min="0" value={capAdults} onChange={e=>setCapAdults(e.target.value)} placeholder="مثال: 2" />
          </Field>
          <Field label="عدد القاصرين">
            <input className="input" type="number" min="0" value={capMinors} onChange={e=>setCapMinors(e.target.value)} placeholder="مثال: 2" />
          </Field>
        </div>

        <Field label="المزايا">
          <div className="ap-chips">
            {AMENITIES.map(a=>(
              <Chip key={a.key} active={amen[a.key]} onClick={()=>toggleAmen(a.key)}>{a.label}</Chip>
            ))}
          </div>
        </Field>

        <div className="ap-prices">
          <Field label="سعر يومي">
            <div className="ap-pricebox">
              <input className="input" type="number" min="0" value={priceDay} onChange={e=>setPriceDay(e.target.value)} placeholder="مثال: 25" />
              <span className="ap-unit">$ / يوم</span>
            </div>
          </Field>

          <Field label="سعر أسبوعي">
            <div className="ap-pricebox">
              <input className="input" type="number" min="0" value={priceWeek} onChange={e=>setPriceWeek(e.target.value)} placeholder="مثال: 120" />
              <span className="ap-unit">$ / أسبوع</span>
            </div>
          </Field>

          <Field label="سعر شهري">
            <div className="ap-pricebox">
              <input className="input" type="number" min="0" value={priceMonth} onChange={e=>setPriceMonth(e.target.value)} placeholder="مثال: 450" />
              <span className="ap-unit">$ / شهر</span>
            </div>
          </Field>
        </div>

        <Field label="الصور">
          <ImagesInput
            urls={imageUrls} setUrls={setImageUrls}
            files={imageFiles} setFiles={setImageFiles}
          />
        </Field>

        <div className="ap-actions">
          <button type="button" className="btn ap-cancel" onClick={()=>navigate(-1)}>إلغاء</button>
          <button type="submit" className="btn btn-primary ap-submit" disabled={saving}>
            {saving ? 'يحفظ…' : 'نشر العقار'}
          </button>
        </div>
      </form>
    </div>
  );
}
