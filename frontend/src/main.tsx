import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthSessionProvider } from './modules/auth/session/AuthSessionContext';
import { AppRouter } from './router';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthSessionProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthSessionProvider>
  </React.StrictMode>
);
