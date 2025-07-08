import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function FichesHoraires() {
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchFiches();
  }, []);

  async function fetchFiches() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fiches-horaires');
      if (!res.ok) throw new Error('Erreur lors du chargement des fiches horaires');
      const data = await res.json();
      setFiches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!file) {
      setUploadError('Veuillez sélectionner un fichier.');
      return;
    }
    if (!displayName.trim()) {
      setUploadError('Veuillez entrer un nom d\'affichage.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('displayName', displayName.trim());

    try {
      const res = await fetch('/api/fiches-horaires', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors du téléchargement du fichier');
      }
      setUploadSuccess('Fichier téléchargé avec succès.');
      setFile(null);
      setDisplayName('');
      await fetchFiches();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <Layout><p>Chargement des fiches horaires...</p></Layout>;
  if (error) return <Layout><p className="text-danger">{error}</p></Layout>;

  return (
    <Layout>
      <div className="container py-4" style={{ maxWidth: '700px' }}>
        <h1>Fiches Horaires</h1>

        

{fiches.length === 0 ? (
  <p>Aucune fiche horaire disponible.</p>
) : (
  <ul className="list-group">
{fiches.map(fiche => {
      // Parse display_name JSON string if possible, else fallback to string cleaning
      let cleanDisplayName = fiche.display_name;
      try {
        const parsedName = JSON.parse(fiche.display_name);
        if (Array.isArray(parsedName)) {
          cleanDisplayName = parsedName.join(' - ');
        } else if (typeof parsedName === 'string') {
          cleanDisplayName = parsedName;
        }
      } catch {
        cleanDisplayName = fiche.display_name.replace(/[\[\]"]/g, '');
      }

      // Remove "public/" prefix from file_path if present
      let filePath = fiche.file_path;
      if (filePath.startsWith('public/')) {
        filePath = filePath.substring('public/'.length);
      }

      // Remove trailing numeric ID before file extension in filename
      const originalFileName = filePath.split('/').pop();
      const fileName = originalFileName.replace(/-\d+(?=\.[^.]+$)/, '');
      const fileHref = `/fiches-horaires/${fileName}`;

      return (
        <li key={fiche.id} className="list-group-item d-flex justify-content-between align-items-center">
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {cleanDisplayName}
          </a>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.open(fileHref, '_blank')}
          >
            Visualiser PDF
          </button>
        </li>
      );
    })}
  </ul>
)}
      </div>
    </Layout>
  );
}
