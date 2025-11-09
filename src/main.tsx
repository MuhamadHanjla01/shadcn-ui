import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear service worker cache to force fresh data on deploy
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('🧹 Cleared service worker');
    }
  });
}

// Clear all caches to force fresh data
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log('🧹 Cleared cache:', name);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
