import './bones/registry';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Sender from './components/shared/Sender';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker
registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const params = new URLSearchParams(window.location.search);
const isPhoneSender = params.get('camera') === 'sender';

root.render(
  <React.StrictMode>
    {isPhoneSender ? <Sender /> : <App />}
  </React.StrictMode>
);
