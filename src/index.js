import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import '@fontsource/rubik'; // משקל ברירת מחדל 400
import '@fontsource/rubik/500.css'; // משקל 500
import '@fontsource/rubik/700.css'; // משקל 700
import './index.css';








const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
