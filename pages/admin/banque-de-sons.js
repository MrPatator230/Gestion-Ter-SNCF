import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import FileUploader from '../../components/FileManager/FileUploader';

export default function BanqueDeSons() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch folders and files
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch folders
      const foldersResponse = await fetch('/api/audio-files?type=folders');
      if (!foldersResponse.ok) throw new Error('Erreur lors du chargement des dossiers');
      const foldersData = await foldersResponse.json();
      setFolders(foldersData.folders || []);

      // Fetch files for the selected folder
      const filesResponse = await fetch(`/api/audio-files${selectedFolderId ? `?folderId=${selectedFolderId}` : ''}`);
      if (!filesResponse.ok) throw new Error('Erreur lors du chargement des fichiers');
      const filesData = await filesResponse.json();
      setAudioFiles(filesData.files || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedFolderId]);

  const handleFolderCreate = async () => {
    if (!newFolderName.trim()) {
      alert('Le nom du dossier ne peut pas être vide.');
      return;
    }

    try {
      const response = await fetch('/api/audio-files?type=folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() })
      });

      if (!response.ok) throw new Error('Erreur lors de la création du dossier');

      setNewFolderName('');
      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error creating folder:', err);
    }
  };

  const handleFolderDelete = async (folderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/audio-files?type=folders&id=${folderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression du dossier');

      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting folder:', err);
    }
  };

  const handleFolderRename = async (folderId, newName) => {
    try {
      const response = await fetch(`/api/audio-files?type=folders&id=${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });

      if (!response.ok) throw new Error('Erreur lors du renommage du dossier');

      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error renaming folder:', err);
    }
  };

  const handleFileUpload = async (uploadedFiles) => {
    await fetchData();
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h1 className="mb-4">Banque de sons</h1>

        {/* Folder creation */}
        <div className="mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Nom du nouveau dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleFolderCreate}
            >
              <i className="fas fa-folder-plus me-2"></i>
              Créer un dossier
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button
              type="button"
              className="btn-close float-end"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        <div className="row">
          {/* Folders list */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-folder-open me-2"></i>
                  Dossiers
                </h5>
              </div>
              <div className="list-group list-group-flush">
                <div
                  className={`list-group-item ${selectedFolderId === null ? 'active' : ''}`}
                  role="button"
                  onClick={() => setSelectedFolderId(null)}
                >
                  <div className="d-flex align-items-center">
                    <i className="fas fa-folder me-2"></i>
                    <span>Tous les fichiers</span>
                  </div>
                </div>
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`list-group-item ${selectedFolderId === folder.id ? 'active' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div
                        className="d-flex align-items-center"
                        role="button"
                        onClick={() => setSelectedFolderId(folder.id)}
                      >
                        <i className="fas fa-folder me-2"></i>
                        <span>{folder.name}</span>
                      </div>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newName = prompt('Nouveau nom du dossier:', folder.name);
                            if (newName && newName !== folder.name) {
                              handleFolderRename(folder.id, newName);
                            }
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderDelete(folder.id);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Files area */}
          <div className="col-md-9">
            <FileUploader
              onUpload={handleFileUpload}
              selectedFolder={selectedFolderId}
              folders={folders}
            />

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : audioFiles.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-music fa-3x mb-3"></i>
                <h5>Aucun fichier audio dans ce dossier</h5>
                <p>Glissez-déposez des fichiers audio ou cliquez pour en sélectionner</p>
              </div>
            ) : (
              <div className="list-group">
                {audioFiles.map((file) => (
                  <div
                    key={file.id}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <i className="fas fa-music text-primary me-3"></i>
                      <div>
                        <h6 className="mb-0">{file.name}</h6>
                        <small className="text-muted">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <audio controls src={file.url} className="me-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
