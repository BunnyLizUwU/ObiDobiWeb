'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registrado con éxito. Scope:', registration.scope);
          })
          .catch(err => {
            console.error('Fallo en el registro del ServiceWorker:', err);
          });
      });
    }
  }, []);

  return null;
}
