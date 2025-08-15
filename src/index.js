import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function ErrorBoundary({ children }) {
  return (
    <React.Suspense fallback={<div style={{padding:16,textAlign:'center'}}>جارِ التحميل…</div>}>
      {children}
    </React.Suspense>
  );
}

// التقط أي خطأ غير معالَج وأظهره بدل شاشة بيضاء
window.addEventListener('error', (e) => {
  const box = document.getElementById('fatal-error-box');
  if (!box) return;
  box.style.display = 'block';
  box.innerText = `⚠ حدث خطأ: ${e.message || e.type}`;
});
window.addEventListener('unhandledrejection', (e) => {
  const box = document.getElementById('fatal-error-box');
  if (!box) return;
  box.style.display = 'block';
  box.innerText = `⚠ رفض وعد غير معالَج: ${e.reason?.message || ''}`;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <div id="fatal-error-box" style={{
      display:'none', position:'fixed', inset:'16px', background:'#fff',
      border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px',
      boxShadow:'0 10px 30px rgba(0,0,0,.1)', zIndex:99999, direction:'rtl'
    }} />
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </>
);
