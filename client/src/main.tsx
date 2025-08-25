import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to catch runtime errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Prevent the error from breaking the app
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection caught:', event.reason);
  // Prevent the error from breaking the app
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
