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

const AMENITIES = [
  {key:'ac', label:'تكييف'},
  {key:'elevator', label:'مصعد'},
  {key:'parking', label:'موقف'},
  {key:'wifi', label:'إنترنت'},
  {key:'furnished', label:'مفروشة'},
];

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
  const [amen, setAmen] = useState({ ac:false, elevator:false, parking:false, wifi:false, furnished:false });

  const [priceDay, setPriceDay] = useState('');
  const [priceWeek, setPriceWeek] = useState('');
  const [priceMonth, setPriceMonth] = useState('');

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
    if (!priceDay && !priceWeek && !priceMonth) return 'أدخل سعرًا واحدًا على الأقل (يومي/أسبوعي/شهري)';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    try {
      setSaving(true);

      const data = {
        ownerId: user.uid,
        title: title.trim(),
        province, type,
        rooms: Number(rooms),
        area: Number(area),
        address: address.trim(),
        description: desc.trim(),
        amenities: amen,
        prices: {
          day: priceDay ? Number(priceDay) : null,
          week: priceWeek ? Number(priceWeek) : null,
          month: priceMonth ? Number(priceMonth) : null,
        },
        images: imageUrls,         // روابط صور جاهزة
        createdAt: serverTimestamp(),
        status: 'active',
      };

      // حفظ
      const col = collection(db, 'properties');
      const docRef = await addDoc(col, data);

      // تتبع حدث
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
      <form className="ap-card" onSubmit={onSubmit}>
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

          <Field label="العنوان التفصيلي">
            <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="مثال: المزة – فيلات شرقية" />
          </Field>

          <Field label="وصف العقار">
            <textarea className="input" rows={4} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="اكتب وصفًا مختصرًا عن العقار والمزايا القريبة…" />
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
