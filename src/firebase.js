// ---- Core ----
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as fbLogEvent, isSupported } from 'firebase/analytics';

// ---- Firestore ----
import {
  getFirestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

// ---- Auth ----
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile
} from 'firebase/auth';

// ---- Storage ----
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCm9gH7teQdv5jETLuANm-J9pN1I3k9TRc",
  authDomain: "syriabooking-841e5.firebaseapp.com",
  projectId: "syriabooking-841e5",
  storageBucket: "syriabooking-841e5.appspot.com",
  messagingSenderId: "858108774964",
  appId: "1:858108774964:web:65ec66e6c38927d87c9861",
  measurementId: "G-3D1PC741MY"
};

const app = initializeApp(firebaseConfig);

// Instances
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Analytics (قد لا يعمل محليًا بدون HTTPS)
let analytics = null;
isSupported().then(ok => { if (ok) analytics = getAnalytics(app); });
export const trackEvent = (name, params = {}) => { try { if (analytics) fbLogEvent(analytics, name, params); } catch {} };

// ===== Helpers: Events & Bookings =====
export const addEvent = async (payload) =>
  addDoc(collection(db, 'events'), { ...payload, ts: serverTimestamp() });

export const addBooking = async ({ propId, ownerId, renterId, from, to, notes }) =>
  addDoc(collection(db, 'bookings'), {
    propId, ownerId, renterId, from, to, notes: notes || '',
    status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });

export const updateBookingStatus = async (bookingId, status) =>
  updateDoc(doc(db, 'bookings', bookingId), { status, updatedAt: serverTimestamp() });

// ===== Helpers: Upload & Property =====
export const uploadImagesAndGetURLs = async (files = [], ownerId = 'anon') => {
  const urls = [];
  for (const f of files) {
    const key = `props/${ownerId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
    const r = ref(storage, key);
    await uploadBytes(r, f);
    const url = await getDownloadURL(r);
    urls.push(url);
  }
  return urls;
};

export const addProperty = async (payload) => {
  // payload: { title, description, province, type, prices..., amenities[], imagesURLs[], ownerId }
  return addDoc(collection(db, 'properties'), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export {
  // instances
  db, auth, storage,

  // firestore
  collection, addDoc, doc, getDoc, getDocs, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp,

  // auth
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile,

  // storage
  ref, uploadBytes, getDownloadURL,
};
