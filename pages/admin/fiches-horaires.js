import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function AdminFichesHoraires() {
  const [fiches, setFiches] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchFiches();
  }, []);

  const fetchFiches = async () => {
    try {
      const res = await fetch('/api/fiches-horaires');
      if (!res.ok) throw new Error('Erreur lors du chargement des fiches horaires');
      const data = await res.json();
      setFiches(data);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!displayName || !file) {
      setMessage({ type: 'error', text: 'Veuillez fournir un nom d\'affichage et un fichier PDF.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('displayName', displayName);
    formData.append('file', file);

    try {
      const res = await fetch('/api/fiches-horaires', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }
      setDisplayName('');
      setFile(null);
      await fetchFiches();
      setMessage({ type: 'success', text: 'Fiche horaire ajoutée avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette fiche horaire ?')) return;
    try {
      const res = await fetch(`/api/fiches-horaires/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      await fetchFiches();
      setMessage({ type: 'success', text: 'Fiche horaire supprimée avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <Layout>
      <div className="container py-4" style={{ maxWidth: '700px' }}>
        <h1>Gestion des Fiches Horaires</h1>
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
            {message.text}
          </div>
        )}
        <form onSubmit={handleUpload} className="mb-4">
          <div className="mb-3">
            <label htmlFor="displayName" className="form-label">Nom d'affichage</label>
            <input
              type="text"
              id="displayName"
              className="form-control"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="file" className="form-label">Fichier PDF</label>
            <input
              type="file"
              id="file"
              className="form-control"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Chargement...' : 'Ajouter la fiche horaire'}
          </button>
        </form>

        <h2>Fiches Horaires existantes</h2>
        {fiches.length === 0 ? (
          <p>Aucune fiche horaire disponible.</p>
        ) : (
          <ul className="list-group">
            {fiches.map(fiche => (
              <li key={fiche.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{fiche.display_name}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(fiche.id)}>
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
