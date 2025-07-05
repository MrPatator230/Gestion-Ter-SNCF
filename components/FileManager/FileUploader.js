import { useState, useRef } from 'react';

export default function FileUploader({ onUpload, selectedFolder, folders }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = [...e.dataTransfer.files];
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = [...e.target.files];
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    setError(null);
    setIsUploading(true);

    try {
      const audioFiles = files.filter(file => file.type.startsWith('audio/'));
      if (audioFiles.length === 0) {
        throw new Error('Veuillez sélectionner des fichiers audio (MP3, WAV, OGG, etc.)');
      }

      const formData = new FormData();
      audioFiles.forEach(file => {
        formData.append('files', file);
      });

      if (selectedFolder) {
        formData.append('folderId', selectedFolder);
      }

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du téléchargement');
      }

      const data = await response.json();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show edit dialog for the first uploaded file
      if (data.uploadedFiles && data.uploadedFiles.length > 0) {
        setUploadedFile(data.uploadedFiles[0]);
        setNewFileName(data.uploadedFiles[0].name);
        setShowEditDialog(true);
      }

      onUpload(data.uploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Erreur lors du téléchargement des fichiers');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRename = async () => {
    try {
      const response = await fetch(`/api/audio-files?type=rename&id=${uploadedFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFileName })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du renommage du fichier');
      }

      onUpload([{ ...uploadedFile, name: newFileName }]);
      setShowEditDialog(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleMove = async (targetFolderId) => {
    try {
      const response = await fetch(`/api/audio-files?type=move&id=${uploadedFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: targetFolderId })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du déplacement du fichier');
      }

      onUpload([{ ...uploadedFile, folderId: targetFolderId }]);
      setShowMoveDialog(false);
      setShowEditDialog(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/audio-files?id=${uploadedFile.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du fichier');
      }

      onUpload([]);
      setShowEditDialog(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="mb-4">
      <div
        className={`upload-zone card ${isDragging ? 'border-primary' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
      >
        <div className="card-body text-center py-5">
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            multiple
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close float-end" 
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                }}
              ></button>
            </div>
          )}

          <div className="upload-icon mb-3">
            <i className={`fas fa-${isUploading ? 'spinner fa-spin' : 'cloud-upload-alt'} fa-3x text-primary`}></i>
          </div>
          <h5>{isUploading ? 'Téléchargement en cours...' : 'Glissez-déposez vos fichiers audio ici'}</h5>
          <p className="text-muted mb-0">
            {isUploading ? 'Veuillez patienter...' : 'ou cliquez pour sélectionner'}
          </p>
          <small className="d-block text-muted mt-2">
            Formats acceptés : MP3, WAV, OGG, etc.
          </small>
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && uploadedFile && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-music me-2"></i>
                  Fichier audio importé
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditDialog(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom du fichier</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <audio controls src={uploadedFile.url} className="w-100" />
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleRename}
                  >
                    <i className="fas fa-check me-2"></i>
                    Enregistrer
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowMoveDialog(true)}
                  >
                    <i className="fas fa-folder me-2"></i>
                    Déplacer
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Dialog */}
      {showMoveDialog && uploadedFile && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-folder-open me-2"></i>
                  Déplacer vers
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMoveDialog(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="list-group">
                  <button
                    className="list-group-item list-group-item-action d-flex align-items-center"
                    onClick={() => handleMove(null)}
                  >
                    <i className="fas fa-folder me-2"></i>
                    Dossier racine
                  </button>
                  {folders?.map(folder => (
                    <button
                      key={folder.id}
                      className="list-group-item list-group-item-action d-flex align-items-center"
                      onClick={() => handleMove(folder.id)}
                    >
                      <i className="fas fa-folder me-2"></i>
                      {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .upload-zone {
          transition: all 0.3s ease;
          border: 2px dashed #dee2e6;
        }
        .upload-zone:hover:not(.disabled) {
          border-color: #007bff;
        }
        .upload-zone.border-primary {
          border-color: #007bff;
          background-color: rgba(0, 123, 255, 0.05);
        }
        .modal {
          background-color: rgba(0, 0, 0, 0.5);
        }
        .gap-2 {
          gap: 0.5rem;
        }
        .upload-icon {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
