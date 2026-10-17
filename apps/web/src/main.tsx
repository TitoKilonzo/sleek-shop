import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/latin-700.css';
import './lib/pwa';
import App from './App';
import './styles.css';

registerSW({ immediate: true });
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
