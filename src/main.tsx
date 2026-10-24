import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/outfit';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/dm-mono/400.css';
import App from './App';
import './styles.css';
import './responsive.css';
import './world.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
