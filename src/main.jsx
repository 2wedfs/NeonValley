import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'

function showStartupError(error) {
  console.error('NeonValley startup error', error);
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = '<div style="min-height:100vh;background:#050509;color:white;font-family:Inter,system-ui;padding:32px;display:flex;align-items:center;justify-content:center"><div style="max-width:640px;border:1px solid rgba(255,255,255,.14);border-radius:24px;padding:24px;background:rgba(255,255,255,.06)"><p style="color:#F72585;text-transform:uppercase;font-size:12px;font-weight:800;letter-spacing:.08em">Startup Error</p><h1 style="font-size:26px;margin:8px 0">NeonValley could not load</h1><pre style="white-space:pre-wrap;color:rgba(255,255,255,.72);font-size:13px;line-height:1.5">' + String(error?.stack || error?.message || error).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])) + '</pre></div></div>';
}

window.addEventListener('error', (event) => showStartupError(event.error || event.message));
window.addEventListener('unhandledrejection', (event) => showStartupError(event.reason));

import('@/App.jsx')
  .then(({ default: App }) => {
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  })
  .catch(showStartupError);
