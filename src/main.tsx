import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with update handling
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
    // Show a toast or notification that the app is ready for offline use
    const offlineToast = document.createElement('div');
    offlineToast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
    offlineToast.textContent = '🐱 Cat Jump Game is ready for offline use!';
    document.body.appendChild(offlineToast);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
      offlineToast.remove();
    }, 3000);
  },
  immediate: true
});

// Initialize IndexedDB for the app
const initializeDB = () => {
  const request = indexedDB.open('catJumpDB', 1);
  
  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    
    // Create scores object store if it doesn't exist
    if (!db.objectStoreNames.contains('scores')) {
      const store = db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
      store.createIndex('by_score', 'score', { unique: false });
      store.createIndex('by_date', 'date', { unique: false });
    }
  };
  
  request.onerror = (event) => {
    console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
  };
};

// Initialize the database
initializeDB();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);