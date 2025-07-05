
import { useState, useEffect } from 'react';

export default function ListeAnnonces() {
  const [annonces, setAnnonces] = useState([]);

  useEffect(() => {
    // Fetch concatenated announcements from API
    fetch('/api/annonces')
      .then(res => res.json())
      .then(data => setAnnonces(data.annonces))
      .catch(err => console.error('Failed to fetch annonces', err));
  }, []);

  return (
    <div className="container mt-4">
      <h1>Liste des annonces concaténées</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nom de l'annonce</th>
            <th>Date de création</th>
            <th>Audio</th>
          </tr>
        </thead>
        <tbody>
          {annonces.length === 0 && (
            <tr>
              <td colSpan="3">Aucune annonce disponible.</td>
            </tr>
          )}
          {annonces.map((annonce) => (
            <tr key={annonce.id}>
              <td>{annonce.name}</td>
              <td>{new Date(annonce.createdAt).toLocaleString()}</td>
              <td>
                <audio controls src={annonce.url} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
