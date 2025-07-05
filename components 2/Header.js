import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { AuthContext } from '../src/contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import styles from '../styles/operatorColors.module.css';
import MobileMenuToggle from './MobileMenuToggle';

export default function Header() {
  const getThemeClass = (logoUrl) => {
    if (!logoUrl) return '';
    const region = logoUrl.split('logo-ter-')[1]?.split('.')[0];
    if (!region) return '';
    return styles[`${region}Theme`];
  };

  const router = useRouter();
  const currentPath = router.pathname;
  const auth = useContext(AuthContext) || {};
  const { user } = auth;
  const settings = useContext(SettingsContext) || {};
  const { logoUrl, appName } = settings;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuLinks = (
    <>
      <Link 
        href="/" 
        className={`nav-link ${currentPath === '/' ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Accueil
      </Link>
      
      <Link 
        href="/verifier-horaires" 
        className={`nav-link ${currentPath === '/verifier-horaires' ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <span className="material-icons me-1">search</span>
        Vérifier Horaires
      </Link>

      <Link 
        href="/actualites" 
        className={`nav-link ${currentPath === '/actualites' ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Actualités
      </Link>

      <Link 
        href="/abonnements-et-billets" 
        className={`nav-link ${currentPath === '/abonnements-et-billets' ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Abonnements & Billets
      </Link>

      <Link 
        href="/horaires-par-gare" 
        className={`nav-link ${currentPath === '/horaires-par-gare' ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Horaires par gare
      </Link>
      <></>
    </>
  );

  return (
    <header className={`mastheader bg-white shadow-sm ${getThemeClass(logoUrl)}`} style={{ fontFamily: "'SNCF', Arial, sans-serif" }}>
      <link rel="icon" href="../favicon.ico" />
      <div className="container-fluid">
        <div className="d-flex align-items-center py-2">
          <Link href="/" className="me-4" aria-label={appName || 'SNCF'}>
            <Image
              src={logoUrl || '/images/sncf-logo.png'}
              alt={appName || 'Logo'}
              width={300}
              height={84}
              priority
            />
          </Link>

          {/* Desktop and tablet menu - hidden on small screens */}
          <nav className="nav flex-grow-1 d-none d-md-flex">
            {menuLinks}
          </nav>

          {/* Mobile menu toggle button - visible only on small screens */}
          <div className="d-md-none me-3">
            <button
              className="btn btn-outline-primary"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className="material-icons">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
              <span className="ms-1">Menu</span>
            </button>
          </div>

          <div className="d-flex align-items-center d-none d-md-flex">
            <Link href="/client/reservations" className="header-icon-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" aria-hidden="true" data-testid="icon-order" focusable="false">
                <path fillRule="evenodd" d="M18.581 1.705l1.185 1.186c-.006.006-.015.006-.022.013-.143.143-.16.392-.015.534l2.258 2.265c.142.14.391.125.533-.018.008-.006.01-.014.014-.02l1.107 1.11c.479.478.479 1.251 0 1.73L8.492 23.643a1.221 1.221 0 0 1-1.73-.004l-5.06-5.066L18.58 1.705zM15.508.357a1.221 1.221 0 0 1 1.73.004l.118.115L.473 17.342l-.116-.116a1.227 1.227 0 0 1 0-1.732z"></path>
              </svg>
              <small>Commande</small>
            </Link>
            <Link href="/panier" className="header-icon-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" height="24" aria-hidden="true" data-testid="icon-shop" focusable="false">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 8.5C13.9329 8.5 15.4999 6.933 15.4999 5C15.4999 3.067 13.9329 1.5 11.9999 1.5C10.0669 1.5 8.49994 3.067 8.49994 5C8.49994 6.933 10.0669 8.5 11.9999 8.5ZM11.9999 10C14.7614 10 16.9999 7.76142 16.9999 5C16.9999 2.23858 14.7614 0 11.9999 0C9.23852 0 6.99994 2.23858 6.99994 5C6.99994 7.76142 9.23852 10 11.9999 10Z"></path>
                <path d="M0.444166 7.36858C0.213385 6.13775 1.15763 5 2.40991 5H21.5902C22.8425 5 23.7867 6.13775 23.5559 7.36858L21.3059 19.3686C21.1286 20.3145 20.3026 21 19.3402 21H4.65991C3.69748 21 2.87153 20.3145 2.69417 19.3686L0.444166 7.36858Z"></path>
              </svg>
              <small>Panier</small>
            </Link>
            {user && user.role === 'client' ? (
              <Link href="/client/" className="header-icon-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" height="24" aria-hidden="true" data-testid="icon-account" focusable="false">
                  <path fillRule="evenodd" d="M14.674 14.864l7.122 1.516c1.31.334 2.204 1.529 2.204 2.895V24H0v-4.725c0-1.366.917-2.56 2.227-2.895l7.122-1.516a10.76 10.76 0 0 1 5.325 0zM12 0a6 6 0 1 1-.001 12.001A6 6 0 0 1 12 0z"></path>
                </svg>
                <small>Compte</small>
              </Link>
            ) : (
              <Link href="/login" className="header-icon-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" height="24" aria-hidden="true" data-testid="icon-account" focusable="false">
                  <path fillRule="evenodd" d="M14.674 14.864l7.122 1.516c1.31.334 2.204 1.529 2.204 2.895V24H0v-4.725c0-1.366.917-2.56 2.227-2.895l7.122-1.516a10.76 10.76 0 0 1 5.325 0zM12 0a6 6 0 1 1-.001 12.001A6 6 0 0 1 12 0z"></path>
                </svg>
                <small>Compte</small>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu popup */}
      {mobileMenuOpen && (
        <div className="mobile-menu-popup">
          <div className="d-flex justify-content-end p-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          <nav className="nav flex-column p-3 mb-3">
            {menuLinks}
          </nav>
          <div className="d-flex justify-content-around border-top pt-3">
            <Link href="/client/reservations" className="header-icon-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" aria-hidden="true" data-testid="icon-order" focusable="false">
                <path fillRule="evenodd" d="M18.581 1.705l1.185 1.186c-.006.006-.015.006-.022.013-.143.143-.16.392-.015.534l2.258 2.265c.142.14.391.125.533-.018.008-.006.01-.014.014-.02l1.107 1.11c.479.478.479 1.251 0 1.73L8.492 23.643a1.221 1.221 0 0 1-1.73-.004l-5.06-5.066L18.58 1.705zM15.508.357a1.221 1.221 0 0 1 1.73.004l.118.115L.473 17.342l-.116-.116a1.227 1.227 0 0 1 0-1.732z"></path>
              </svg>
              <small>Commande</small>
            </Link>
            <Link href="/panier" className="header-icon-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" height="24" aria-hidden="true" data-testid="icon-shop" focusable="false">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 8.5C13.9329 8.5 15.4999 6.933 15.4999 5C15.4999 3.067 13.9329 1.5 11.9999 1.5C10.0669 1.5 8.49994 3.067 8.49994 5C8.49994 6.933 10.0669 8.5 11.9999 8.5ZM11.9999 10C14.7614 10 16.9999 7.76142 16.9999 5C16.9999 2.23858 14.7614 0 11.9999 0C9.23852 0 6.99994 2.23858 6.99994 5C6.99994 7.76142 9.23852 10 11.9999 10Z"></path>
                <path d="M0.444166 7.36858C0.213385 6.13775 1.15763 5 2.40991 5H21.5902C22.8425 5 23.7867 6.13775 23.5559 7.36858L21.3059 19.3686C21.1286 20.3145 20.3026 21 19.3402 21H4.65991C3.69748 21 2.87153 20.3145 2.69417 19.3686L0.444166 7.36858Z"></path>
              </svg>
              <small>Panier</small>
            </Link>
            {user && user.role === 'client' ? (
              <Link href="/client/" className="header-icon-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" height="24" aria-hidden="true" data-testid="icon-account" focusable="false">
                  <path fillRule="evenodd" d="M14.674 14.864l7.122 1.516c1.31.334 2.204 1.529 2.204 2.895V24H0v-4.725c0-1.366.917-2.56 2.227-2.895l7.122-1.516a10.76 10.76 0 0 1 5.325 0zM12 0a6 6 0 1 1-.001 12.001A6 6 0 0 1 12 0z"></path>
                </svg>
                <small>Compte</small>
              </Link>
            ) : (
              <Link href="/login" className="header-icon-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" width="24" height="24" aria-hidden="true" data-testid="icon-account" focusable="false">
                  <path fillRule="evenodd" d="M14.674 14.864l7.122 1.516c1.31.334 2.204 1.529 2.204 2.895V24H0v-4.725c0-1.366.917-2.56 2.227-2.895l7.122-1.516a10.76 10.76 0 0 1 5.325 0zM12 0a6 6 0 1 1-.001 12.001A6 6 0 0 1 12 0z"></path>
                </svg>
                <small>Compte</small>
              </Link>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .nav-link.active {
          color: var(--primary-color);
        }
        .header-icon-link {
          color: var(--primary-color);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 1rem;
        }
        .header-icon-link small {
          margin-top: 0.25rem;
          font-size: 0.75rem;
        }
        .mobile-menu-popup {
          position: fixed;
          top: 56px; /* height of header */
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 1050;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          overflow-y: auto;
        }
        .mobile-menu-popup .nav-link {
          font-size: 1.25rem;
          padding: 1rem 0;
          border-bottom: 1px solid #ddd;
        }
      `}</style>
    </header>
  );
}
