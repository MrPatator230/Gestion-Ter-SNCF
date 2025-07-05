import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'
import '../styles/operatorColors.css'

import { useEffect } from 'react';
import Head from 'next/head';
import { SettingsProvider } from '../contexts/SettingsContext';
import { initTestData } from '../utils/testData';
import { AuthProvider } from '../src/contexts/AuthContext';
import { TrackAssignmentProvider } from '../src/contexts/TrackAssignmentContext';

function AppWrapper({ children }) {
  return children;
}

export default function MyApp({ Component, pageProps }) {
  // Initialize test data and load scripts
  useEffect(() => {
    initTestData();

    if (typeof window !== 'undefined') {
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      };

      const loadDependencies = async () => {
        try {
          await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
          await loadScript('https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js');
          await loadScript('https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js');
        } catch (error) {
          console.error('Error loading scripts:', error);
        }
      };

      loadDependencies();

      return () => {
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          if (script.src.includes('jquery') || script.src.includes('popper') || script.src.includes('bootstrap')) {
            script.parentNode.removeChild(script);
          }
        });
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>SNCF Gestion</title>
        <meta name="description" content="Gestion des horaires et services SNCF" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <SettingsProvider>
          <TrackAssignmentProvider>
            <AppWrapper>
              <Component {...pageProps} />
            </AppWrapper>
          </TrackAssignmentProvider>
        </SettingsProvider>
      </AuthProvider>
    </>
  );
}
