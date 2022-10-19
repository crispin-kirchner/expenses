import './App.scss';
import 'bootstrap';

import * as db from './services/db.js';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import App from './components/App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals'; // TODO brauchts das?
import t from './utils/texts';

let title = t('Expenses');
if (process.env.NODE_ENV === 'development') {
  title += ' *** DEV ***';
}
document.title = title;

// FIXME prüfen wie das in Zukunft mit der Migration laufen soll
db.setupApplicationDb();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
