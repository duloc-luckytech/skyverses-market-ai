
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  // Show crash info instead of silent white page
  rootElement.innerHTML = `<div style="padding:60px 20px;font-family:monospace;background:#1a1a2e;color:#ef4444;min-height:100vh"><h1>React Mount Error</h1><pre style="white-space:pre-wrap;color:#ffa">${String(err)}</pre></div>`;
  console.error('[MOUNT ERROR]', err);
}
