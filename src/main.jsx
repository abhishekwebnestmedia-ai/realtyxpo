import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import "simple-datatables/dist/style.css";

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initScrollbarAnimation, scrollbarCSS } from './utils/scrollbarUtils.js';
import { NotificationsProvider } from './context/NotificationsContext';

import queryClient from './queryClient';

// Initialize scrollbar animations
initScrollbarAnimation();

// Inject scrollbar CSS
const style = document.createElement('style');
style.textContent = scrollbarCSS;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <App />
        {/* Devtools are optional, but super helpful in dev */}
        <ReactQueryDevtools initialIsOpen={false} />
      </NotificationsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
