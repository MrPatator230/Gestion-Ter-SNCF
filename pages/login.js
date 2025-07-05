import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { AuthContext } from '../src/contexts/AuthContext';
import { SettingsContext } from '../contexts/SettingsContext';
import styles from '../styles/operatorColors.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { login, isAuthenticated, role } = useContext(AuthContext);
  const { 
    logoUrl, 
    appName, 
    companyName,
    companySlogan,
    primaryColor,
    buttonStyle
  } = useContext(SettingsContext);

  const getThemeClass = (logoUrl) => {
    if (!logoUrl) return '';
    const region = logoUrl.split('logo-ter-')[1]?.split('.')[0];
    if (!region) return '';
    return styles[`${region}Theme`];
  };

  if (isAuthenticated) {
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'client') {
      router.push('/client');
    }
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className={`min-vh-100 d-flex flex-column ${getThemeClass(logoUrl)}`}>
      <div className="container-fluid bg-white shadow-sm py-3">
        <Link href="/" className="d-inline-block">
          <Image
            src={logoUrl || '/images/sncf-logo.png'}
            alt={appName || 'SNCF'}
            width={200}
            height={56}
            priority
          />
        </Link>
      </div>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h4 className="mb-1">Bienvenue sur {companyName}</h4>
                    <p className="text-muted">{companySlogan}</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                      <label htmlFor="username" className="form-label">
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{
                          borderRadius: buttonStyle === 'rounded' ? '30px' : '4px'
                        }}
                      />
                    </div>

                    <div className="form-group mb-4">
                      <label htmlFor="password" className="form-label">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          borderRadius: buttonStyle === 'rounded' ? '30px' : '4px'
                        }}
                      />
                    </div>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-lg w-100 mb-3"
                      style={{
                        backgroundColor: primaryColor || 'var(--primary-color)',
                        color: '#fff',
                        borderRadius: buttonStyle === 'rounded' ? '30px' : '4px'
                      }}
                    >
                      Se connecter
                    </button>

                    <div className="text-center">
                      <p className="mb-0">
                        Pas encore de compte ?{' '}
                        <Link 
                          href="/register"
                          style={{ color: primaryColor || 'var(--primary-color)' }}
                        >
                          Inscrivez-vous ici
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-3 text-center">
        <small className="text-muted">
          © {new Date().getFullYear()} {companyName}. Tous droits réservés.
        </small>
      </footer>

      <style jsx>{`
        .form-control:focus {
          border-color: ${primaryColor || 'var(--primary-color)'};
          box-shadow: 0 0 0 0.2rem ${primaryColor}33 || rgba(var(--primary-color), 0.2);
        }
      `}</style>
    </div>
  );
}
