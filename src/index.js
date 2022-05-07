import './styles.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap';

import * as expensesApp from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

expensesApp.onAttach();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
