import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/update-detector'; // Initialize update detection

// Force fresh data on load
if (typeof window !== 'undefined') {
  // Clear any stale cache on page load
  console.log('🔄 Initializing portfolio...');
  
  // Check for updates immediately
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('forceDataReload'));
  }, 1000);
}

createRoot(document.getElementById('root')!).render(<App />);
