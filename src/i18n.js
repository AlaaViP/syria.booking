import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ===== الترجمات =====
const ar = {
  brand: "Syria Golden Eagle",
  welcome_title: "مرحباً بك في Syria Golden Eagle",
  welcome_desc: "منصة احترافية مستوحاة من Booking لتأجير جميع أنواع العقارات — بتجربة سريعة وأنيقة.",
  search_placeholder: "ابحث باسم المدينة أو الحي أو نوع العقار...",
  filters: "الفلاتر", province: "المحافظة", price_range: "نطاق السعر", rooms: "عدد الغرف",
  add_property: "إضافة عقار", browse: "تصفح", login: "تسجيل الدخول", register: "إنشاء حساب",
  dashboard: "لوحة التحكم", favorites: "المفضلة"
};

const en = {
  brand: "Syria Golden Eagle",
  welcome_title: "Welcome to Syria Golden Eagle",
  welcome_desc: "A Booking-inspired, professional platform to rent all property types — fast and elegant.",
  search_placeholder: "Search by city, district, or property type...",
  filters: "Filters", province: "Province", price_range: "Price range", rooms: "Rooms",
  add_property: "Add property", browse: "Browse", login: "Login", register: "Register",
  dashboard: "Dashboard", favorites: "Favorites"
};

const tr = {
  brand: "Suriye Altın Kartal",
  welcome_title: "Syria Golden Eagle'e hoş geldiniz",
  welcome_desc: "Booking esintili, profesyonel bir kiralama platformu — hızlı ve şık.",
  search_placeholder: "Şehir, semt veya emlak türü ara...",
  filters: "Filtreler", province: "İl", price_range: "Fiyat aralığı", rooms: "Oda",
  add_property: "İlan ekle", browse: "Göz at", login: "Giriş", register: "Kayıt ol",
  dashboard: "Panel", favorites: "Favoriler"
};

const de = {
  brand: "Syrischer Goldener Adler",
  welcome_title: "Willkommen bei Syria Golden Eagle",
  welcome_desc: "Von Booking inspiriert: professionelle Vermietungsplattform — schnell und elegant.",
  search_placeholder: "Suche nach Stadt, Bezirk oder Immobilientyp...",
  filters: "Filter", province: "Provinz", price_range: "Preisspanne", rooms: "Zimmer",
  add_property: "Immobilie hinzufügen", browse: "Stöbern", login: "Anmelden", register: "Registrieren",
  dashboard: "Dashboard", favorites: "Favoriten"
};

const resources = {
  ar: { translation: ar },
  en: { translation: en },
  tr: { translation: tr },
  de: { translation: de }
};

// ===== التهيئة الآمنة =====
try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'ar',
      debug: false,
      detection: {
        order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      },
      interpolation: { escapeValue: false }
    });
} catch (e) {
  console.error('i18n init error:', e);
}

export default i18n;
