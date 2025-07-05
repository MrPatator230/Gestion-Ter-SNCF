import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';

const GITHUB_REPO_API = 'https://api.github.com/repos/MrPatator230/Systeme-de-gestion-de-trains/releases';

export default function Update() {
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [latestVersion, setLatestVersion] = useState(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState('');

  useEffect(() => {
    fetchLatestRelease();
  }, []);

  const fetchLatestRelease = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(GITHUB_REPO_API);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations de la release.');
      }
      const data = await response.json();
      setLatestVersion(data.tag_name || data.name);
      setReleaseNotes(data.body || '');
      if (data.tag_name && data.tag_name !== currentVersion) {
        setUpdateAvailable(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setError('');
    setUpdateResult('');
    try {
      const response = await fetch('/api/update', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour.');
      }
      const data = await response.json();
      setUpdateResult(data.output || 'Mise à jour réussie.');
      setUpdateAvailable(false);
      setCurrentVersion(latestVersion);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content" className="container mt-4 flex-grow-1">
          <h1>Mise à jour de l'application</h1>
          {loading && <p>Chargement des informations de la dernière version...</p>}
          {error && <p className="text-danger">Erreur: {error}</p>}
          {!loading && !error && (
            <>
              <p>Version actuelle : <strong>{currentVersion}</strong></p>
              <p>Dernière version disponible : <strong>{latestVersion || 'N/A'}</strong></p>
              {updateAvailable ? (
                <>
                  <h3>Notes de version</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.25rem' }}>
                    {releaseNotes}
                  </pre>
                  <button className="btn btn-primary mt-3" onClick={handleUpdate} disabled={updating}>
                    {updating ? 'Mise à jour en cours...' : 'Mettre à jour maintenant'}
                  </button>
                  {updateResult && (
                    <pre className="mt-3" style={{ whiteSpace: 'pre-wrap', backgroundColor: '#e9ecef', padding: '1rem', borderRadius: '0.25rem' }}>
                      {updateResult}
                    </pre>
                  )}
                </>
              ) : (
                <p>L'application est à jour.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
