import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IconContext } from '@phosphor-icons/react';
import App from './App.jsx';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <IconContext.Provider value={{ size: 24, weight: 'regular' }}>
      <App />
    </IconContext.Provider>
  </React.StrictMode>
);
