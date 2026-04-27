import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function enableMocking() {
  const { worker } = await import('./mocks/browser');
  
  // Get the base URL for the service worker
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${baseUrl}mockServiceWorker.js`,
    },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
