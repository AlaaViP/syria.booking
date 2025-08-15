import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n'; // إن كنت تستعمل i18n

const App = lazy(() => import('./App'));

function showFatal(msg) {
  const el = document.getElementById('fatal-error-box');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = `⚠ ${msg}`;
}
window.addEventListener('error', (e) => showFatal(e.message || e.type));
window.addEventListener('unhandledrejection', (e) => showFatal(e.reason?.message || 'Unhandled rejection'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <div id="fatal-error-box" style={{
      display:'none', position:'fixed', inset:'16px', background:'#fff',
      border:'1px solid #e5e7eb', borderRadius:12, padding:16,
      boxShadow:'0 10px 30px rgba(0,0,0,.1)', zIndex:999999, direction:'rtl', whiteSpace:'pre-wrap'
    }} />
    <Suspense fallback={<div style={{padding:16,textAlign:'center'}}>جارِ التحميل…</div>}>
      <App />
    </Suspense>
  </>
);
