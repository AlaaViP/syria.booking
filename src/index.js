import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function ErrorCatcher({ children }) {
  return (
    <React.Suspense fallback={<div style={{padding:16,textAlign:'center'}}>جارِ التحميل…</div>}>
      {children}
    </React.Suspense>
  );
}

// عرض أي خطأ قاتل على الصفحة (بدل شاشة بيضاء)
const showFatal = (msg) => {
  const el = document.getElementById('fatal-error-box');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = `⚠ ${msg}`;
};
window.addEventListener('error', (e) => showFatal(e.message || e.type));
window.addEventListener('unhandledrejection', (e) => showFatal(e.reason?.message || 'Unhandled rejection'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <div id="fatal-error-box" style={{
      display:'none', position:'fixed', inset:'16px', background:'#fff',
      border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px',
      boxShadow:'0 10px 30px rgba(0,0,0,.1)', zIndex:999999, direction:'rtl', whiteSpace:'pre-wrap'
    }} />
    <ErrorCatcher>
      <App />
    </ErrorCatcher>
  </>
);
