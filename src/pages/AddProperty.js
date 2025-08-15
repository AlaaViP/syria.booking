import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProperty, uploadImagesAndGetURLs } from '../firebase';
import { useAuth } from '../context/AuthContext';

const AMENITIES = ['تكييف','تدفئة','إنترنت','موقف','مصعد','مفروش'];
const TYPES = ['شقة','منزل','استوديو','مكتب','فيلا','محل'];

export default function AddProperty() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', type: '', description: '', province: '',
    area: '', rooms: '',
    daily_price: '', weekly_price: '', monthly_price: '',
    lat: '', lng: '',
    amenities: [],
    images: [], previews: []
  });
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ step: 'idle', note: '' });

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleAmenity = (name) =>
    setForm(prev => ({ ...prev, amenities: prev.amenities.includes(name) ? prev.amenities.filter(a=>a!==name) : [...prev.amenities, name] }));

  const onImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    Promise.all(files.map(f => new Promise(res => { const r=new FileReader(); r.onload=()=>res({file:f,url:r.result}); r.readAsDataURL(f); })))
      .then(list => setForm(prev => ({ ...prev, images:[...prev.images,...list.map(x=>x.file)], previews:[...prev.previews,...list.map(x=>x.url)] })));
  };
  const removePreview = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_,idx)=>idx!==i), previews: prev.previews.filter((_,idx)=>idx!==i) }));

  const validate = () => {
    if (!form.title.trim()) return 'العنوان مطلوب';
    if (!form.type) return 'اختر نوع العقار';
    if (!form.province.trim()) return 'المحافظة مطلوبة';
    if (!form.area || Number(form.area) <= 0) return 'المساحة غير صحيحة';
    if (!form.daily_price && !form.weekly_price && !form.monthly_price) return 'أدخل سعرًا واحدًا على الأقل (يومي/أسبوعي/شهري)';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert('الرجاء تسجيل الدخول قبل إضافة عقار.'); return; }
    const err = validate();
    if (err) return alert(err);

    try {
      setSaving(true);
      setProgress({ step: 'upload', note: 'جاري رفع الصور…' });

      // ارفع الصور (أو تخطَّ إذا لا توجد صور)
      let imagesURLs = [];
      if (form.images.length > 0) {
        imagesURLs = await uploadImagesAndGetURLs(form.images, user.uid);
      }

      setProgress({ step: 'save', note: 'جاري حفظ بيانات العقار…' });

      await addProperty({
        title: form.title,
        type: form.type,
        description: form.description,
        province: form.province,
        area: Number(form.area)||0,
        rooms: Number(form.rooms)||0,
        daily_price: form.daily_price || null,
        weekly_price: form.weekly_price || null,
        monthly_price: form.monthly_price || null,
        lat: form.lat || null,
        lng: form.lng || null,
        amenities: form.amenities,
        images: imagesURLs,
        ownerId: user.uid,
      });

      alert('تم حفظ العقار على Firestore ✅');
      nav('/dashboard');
    } catch (e2) {
      console.error('[AddProperty] Error:', e2);
      alert('تعذّر الحفظ: ' + (e2?.message || 'تحقق من الصلاحيات أو الاتصال'));
      setProgress({ step: 'error', note: e2?.message || '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="card form">
        <div className="form__header">
          <h2>إضافة عقار</h2>
          <p>املأ الحقول التالية بدقّة. يمكنك رفع صور وسيتم عرضها للمعاينة قبل الحفظ.</p>
          {saving && (
            <div style={{marginTop:8, fontSize:12, color:'#6b7280'}}>
              ⏳ {progress.step === 'upload' && 'رفع الصور…'}
              {progress.step === 'save' && 'حفظ البيانات…'}
              {progress.step === 'error' && 'حدث خطأ — راجع السجل.'}
              {progress.note && <span> — {progress.note}</span>}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit}>
          {/* الأساسيات */}
          <div className="form__section">
            <h3 className="section-title">المعلومات الأساسية</h3>
            <div className="form-row">
              <div className="field">
                <label>عنوان الإعلان <span className="req">*</span></label>
                <input className="input" value={form.title} onChange={e=>setField('title', e.target.value)} placeholder="مثال: شقة مفروشة - المزة" />
              </div>
              <div className="field">
                <label>نوع العقار <span className="req">*</span></label>
                <select className="select" value={form.type} onChange={e=>setField('type', e.target.value)}>
                  <option value="">— اختر —</option>
                  {TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label>المحافظة <span className="req">*</span></label>
                <input className="input" value={form.province} onChange={e=>setField('province', e.target.value)} placeholder="دمشق / حلب / حمص ..." />
              </div>
              <div className="field">
                <label>المساحة (م²) <span className="req">*</span></label>
                <input className="input" type="number" min="0" value={form.area} onChange={e=>setField('area', e.target.value)} placeholder="120" />
              </div>
              <div className="field">
                <label>عدد الغرف</label>
                <input className="input" type="number" min="0" value={form.rooms} onChange={e=>setField('rooms', e.target.value)} placeholder="3" />
              </div>
              <div className="field field--full">
                <label>الوصف</label>
                <textarea className="textarea" rows={4} value={form.description} onChange={e=>setField('description', e.target.value)} placeholder="اكتب وصفًا موجزًا يوضح أهم ميزات العقار..." />
              </div>
            </div>
          </div>

          {/* الأسعار */}
          <div className="form__section">
            <h3 className="section-title">الأسعار</h3>
            <div className="form-row">
              <div className="field"><label>سعر يومي ($)</label><input className="input" type="number" min="0" value={form.daily_price} onChange={e=>setField('daily_price', e.target.value)} /></div>
              <div className="field"><label>سعر أسبوعي ($)</label><input className="input" type="number" min="0" value={form.weekly_price} onChange={e=>setField('weekly_price', e.target.value)} /></div>
              <div className="field"><label>سعر شهري ($)</label><input className="input" type="number" min="0" value={form.monthly_price} onChange={e=>setField('monthly_price', e.target.value)} /></div>
            </div>
          </div>

          {/* الميزات */}
          <div className="form__section">
            <h3 className="section-title">الميزات</h3>
            <div className="chips">
              {AMENITIES.map(a => (
                <button key={a} type="button" onClick={()=>toggleAmenity(a)} className={`chip ${form.amenities.includes(a) ? 'active' : ''}`}>{a}</button>
              ))}
            </div>
          </div>

          {/* الموقع */}
          <div className="form__section">
            <h3 className="section-title">الموقع (اختياري)</h3>
            <div className="form-row">
              <div className="field"><label>خط العرض (lat)</label><input className="input" value={form.lat} onChange={e=>setField('lat', e.target.value)} placeholder="33.5138" /></div>
              <div className="field"><label>خط الطول (lng)</label><input className="input" value={form.lng} onChange={e=>setField('lng', e.target.value)} placeholder="36.2765" /></div>
            </div>
          </div>

          {/* الصور */}
          <div className="form__section">
            <h3 className="section-title">صور العقار</h3>
            <div className="uploader">
              <input id="images" type="file" accept="image/*" multiple onChange={onImages} />
              <label htmlFor="images" className="btn btn-primary">{saving ? 'جاري الرفع…' : 'اختر الصور'}</label>
              <button type="button" className="btn btn-outline" onClick={()=>setForm(prev=>({...prev, images:[], previews:[]}))} disabled={saving}>مسح الصور</button>
              <span className="hint">يمكنك الحفظ بدون صور للتجربة.</span>
            </div>
            {form.previews.length > 0 && (
              <div className="preview-grid">
                {form.previews.map((src, i)=>(
                  <div key={i} className="preview">
                    <img src={src} alt={`preview-${i}`} />
                    <button type="button" className="preview__remove" onClick={()=>removePreview(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form__actions">
            <button type="button" className="btn btn-outline" onClick={()=>nav(-1)} disabled={saving}>إلغاء</button>
            <button type="submit" className="btn btn-save" disabled={saving}>{saving ? 'يحفظ…' : 'حفظ العقار'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
