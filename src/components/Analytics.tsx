import React, { useEffect } from 'react';

/**
 * Analytics - Component tập trung để nhúng Google Analytics + Meta Pixel.
 *
 * Bật/tắt + cấu hình qua Vercel Environment Variables:
 *   VITE_GA_MEASUREMENT_ID        = G-XXXXXXXXXX   (Google Analytics 4)
 *   VITE_GTM_ID                   = GTM-XXXXXXX    (Google Tag Manager)
 *   VITE_META_PIXEL_ID            = 123456789012345 (Meta Pixel / Facebook)
 *
 * Lưu ý: KHÔNG commit các ID thật vào repo. Truyền qua env var từ Vercel Dashboard.
 * Ở local dev, file này sẽ không nhúng gì nếu không có env var.
 */


const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

export const Analytics: React.FC = () => {
  useEffect(() => {
    // ============ Google Analytics 4 ============
    if (GA_MEASUREMENT_ID) {
      // Inject gtag.js
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        // Tắt cookie nếu cần cho GDPR (tuỳ chỉnh theo chính sách Lumi)
        // send_page_view: true (mặc định)
      });
      console.info('[Analytics] Google Analytics 4 đã kích hoạt:', GA_MEASUREMENT_ID);
    }

    // ============ Google Tag Manager ============
    if (GTM_ID) {
      const gtmScript = document.createElement('script');
      gtmScript.async = true;
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `;
      document.head.appendChild(gtmScript);
      console.info('[Analytics] Google Tag Manager đã kích hoạt:', GTM_ID);
    }

    // ============ Meta Pixel (Facebook) ============
    if (META_PIXEL_ID) {
      // noscript fallback cho user tắt JS
      const noscript = document.createElement('noscript');
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.body.appendChild(noscript);

      // Pixel script
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${META_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
      console.info('[Analytics] Meta Pixel đã kích hoạt:', META_PIXEL_ID);
    }

    return () => {
      // Cleanup nếu cần (trong thực tế các script này chỉ chạy 1 lần đầu nên cleanup optional)
    };
  }, []);

  // Không render gì ra DOM
  return null;
};

/**
 * Helper: track custom event. Dùng cho CTA clicks, lead form submit, etc.
 *   trackEvent('cta_click', { button: 'zalo_chat' });
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, eventParams);
  }
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('trackCustom', eventName, eventParams);
  }
  if (window.dataLayer && GTM_ID) {
    window.dataLayer.push({ event: eventName, ...eventParams });
  }
};
