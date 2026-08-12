import React from 'react';
// if (import.meta.env.DEV) {
//   import('@reticlehq/browser');
// }
import ReactDOM from 'react-dom/client';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </ThemeProvider>
  </React.StrictMode>
);
