import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

export default function AdminProfile() {
  const { isAuthenticated, role } = useContext(AuthContext);
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    const adminCreds = JSON.parse(localStorage.getItem('adminCredentials'));
    if (adminCreds) {
      setUsername(adminCreds.username);
      setPassword(adminCreds.password);
      setConfirmPassword(adminCreds.password);
    }
  }, [isAuthenticated, role, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!username) {
      setError('Le nom d\'utilisateur est requis.');
      return;
    }
    if (!password) {
      setError('Le mot de passe est requis.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const newCreds = { username, password };
    localStorage.setItem('adminCredentials', JSON.stringify(newCreds));
    setMessage('Les identifiants ont été mis à jour avec succès.');
  };

  return (
    <Layout>
      <h1>Profil Admin</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Mettre à jour
        </button>
      </form>
    </Layout>
  );
}
