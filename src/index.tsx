import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // this file should have the @tailwind lines
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
