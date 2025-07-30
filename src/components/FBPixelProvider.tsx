import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { fbPageView } from '../conversion-api';
import Cookies from 'universal-cookie';

type Props = {
  children: React.ReactNode
};

const FBPixelProvider = ({ children }: Props) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('fbclid')) {
        const cookies = new Cookies();
        if (!cookies.get('_fbc')) {
          const fbclid = url.searchParams.get('fbclid');
          if (fbclid) {
            const timestamp = Math.floor(Date.now() / 1000);
            cookies.set('_fbc', `fb.1.${timestamp}.${fbclid}`, { path: '/' });
          }
        }
      }
    }

    fbPageView();

    router.events.on('routeChangeComplete', fbPageView);
    return () => {
      router.events.off('routeChangeComplete', fbPageView);
    };
  }, [router.events]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {children}
    </>
  );
};

export default FBPixelProvider;
