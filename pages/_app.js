import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'
import '../styles/operatorColors.css'

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SettingsProvider } from '../contexts/SettingsContext';
import { initTestData } from '../utils/testData';
import { AuthProvider } from '../src/contexts/AuthContext';
import { TrackAssignmentProvider } from '../src/contexts/TrackAssignmentContext';
function AppWrapper({ children }) {
  return children;
}

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Determine if current route is an afficheur page
  const isAfficheurPage = router.pathname.startsWith('/afficheurs');

  return (
    <>
      <Head>
        <title>TER Ferrovia Bourgogne - Franche-Comté</title>
        <meta name="description" content="Gestion des horaires et services TER" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <SettingsProvider>
          <TrackAssignmentProvider>
            <div className={isAfficheurPage ? '' : ''}>
              <AppWrapper>
                <Component {...pageProps} />
              </AppWrapper>
            </div>
          </TrackAssignmentProvider>
        </SettingsProvider>
      </AuthProvider>
    </>
  );
}
