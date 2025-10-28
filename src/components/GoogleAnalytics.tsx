import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics() {
  const location = useLocation();
  const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  useEffect(() => {
    // Carregar script do Google Analytics
    if (!GA_ID) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [GA_ID]);

  useEffect(() => {
    // Rastrear mudanças de página
    if (window.gtag && GA_ID) {
      window.gtag('config', GA_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, GA_ID]);

  return null;
}
