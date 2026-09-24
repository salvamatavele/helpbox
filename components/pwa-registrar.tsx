'use client';

import { useEffect } from 'react';

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Helpbox Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('Service Worker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
