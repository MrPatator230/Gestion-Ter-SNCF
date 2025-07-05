import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';

export default function ConceptionAnnonce() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [announcementName, setAnnouncementName] = useState('');
  const [savedAnnouncements, setSavedAnnouncements] = useState([]);

  useEffect(() => {
    const savedAudioFiles = localStorage.getItem('audioFiles');
    if (savedAudioFiles) {
      setAudioFiles(JSON.parse(savedAudioFiles));
    }
    const savedAnnonces = localStorage.getItem('savedAnnouncements');
    if (savedAnnonces) {
      setSavedAnnouncements(JSON.parse(savedAnnonces));
    }
  }, []);

  const toggleFileSelection = (file) => {
    if (selectedFiles.find(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const saveAnnouncement = () => {
    if (!announcementName.trim()) {
      alert('Veuillez entrer un nom pour l\'annonce.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins un fichier audio.');
      return;
    }

    // Concatenate audio data URLs (simple concatenation of base64 strings is not audio concatenation,
    // but for demo purposes, we store the sequence of files)
    const newAnnouncement = {
      id: Date.now(),
      name: announcementName.trim(),
      files: selectedFiles,
      createdAt: new Date().toISOString(),
    };

    const updatedAnnouncements = [...savedAnnouncements, newAnnouncement];
    setSavedAnnouncements(updatedAnnouncements);
    localStorage.setItem('savedAnnouncements', JSON.stringify(updatedAnnouncements));

    setAnnouncementName('');
    setSelectedFiles([]);
    alert('Annonce sauvegardée avec succès.');
  };

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ height: '100vh', overflowY: 'auto' }}>
        <Sidebar />
      </div>
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1 p-4">
        <h1>Conception d'annonce</h1>
        <div className="mb-3">
          <label htmlFor="announcementName" className="form-label">Nom de l'annonce</label>
          <input
            id="announcementName"
            type="text"
            className="form-control"
            value={announcementName}
            onChange={(e) => setAnnouncementName(e.target.value)}
          />
        </div>
        <div>
          <h5>Fichiers audio disponibles</h5>
          {audioFiles.length === 0 && <p>Aucun fichier audio disponible.</p>}
          <ul className="list-group mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {audioFiles.map((file) => (
              <li
                key={file.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${selectedFiles.find(f => f.id === file.id) ? 'active' : ''}`}
                onClick={() => toggleFileSelection(file)}
                style={{ cursor: 'pointer' }}
              >
                {file.name}
                <audio controls src={file.data} style={{ maxWidth: '200px' }} />
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-primary mb-4" onClick={saveAnnouncement}>Sauvegarder l'annonce</button>

        <div>
          <h5>Annonces sauvegardées</h5>
          {savedAnnouncements.length === 0 && <p>Aucune annonce sauvegardée.</p>}
          <ul className="list-group">
            {savedAnnouncements.map((annonce) => (
              <li key={annonce.id} className="list-group-item">
                <strong>{annonce.name}</strong> - Créée le {new Date(annonce.createdAt).toLocaleString()}
                <div className="d-flex flex-wrap mt-2">
                  {annonce.files.map((file) => (
                    <audio key={file.id} controls src={file.data} style={{ maxWidth: '200px', marginRight: '10px', marginBottom: '10px' }} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
