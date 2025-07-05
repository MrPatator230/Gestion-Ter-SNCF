import { useState } from 'react';

export default function FileList({ files, folders, onDelete, onMove, onRename, selectedFolder }) {
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedFileForMove, setSelectedFileForMove] = useState(null);

  const handleRename = async (fileId) => {
    if (newFileName.trim() && newFileName !== editingFile.name) {
      await onRename(fileId, newFileName.trim());
    }
    setEditingFile(null);
    setNewFileName('');
  };

  const startMoving = (file) => {
    setSelectedFileForMove(file);
    setShowMoveDialog(true);
  };

  const handleMove = async (fileId, targetFolderId) => {
    await onMove(fileId, targetFolderId);
    setShowMoveDialog(false);
    setSelectedFileForMove(null);
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      await onDelete(fileId);
    }
  };

  return (
    <div className="file-list">
      {files.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <i className="fas fa-music fa-3x text-muted mb-3"></i>
          <p className="text-muted mb-0">Aucun fichier audio dans ce dossier</p>
        </div>
      ) : (
        <div className="list-group">
          {files.map((file) => (
            <div key={file.id} className="list-group-item">
              <div className="d-flex flex-column">
                {/* File Info and Audio Player */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-music text-primary me-3 fa-lg"></i>
                    {editingFile?.id === file.id ? (
                      <div className="input-group" style={{ width: '300px' }}>
                        <input
                          type="text"
                          className="form-control"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRename(file.id)}
                          autoFocus
                        />
                        <button
                          className="btn btn-success"
                          onClick={() => handleRename(file.id)}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setEditingFile(null)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h6 className="mb-0">{file.name}</h6>
                        <small className="text-muted">
                          {Math.round(file.size / 1024)} KB
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    {editingFile?.id !== file.id && (
                      <>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => {
                            setEditingFile(file);
                            setNewFileName(file.name);
                          }}
                          title="Renommer"
                        >
                          <i className="fas fa-edit"></i> Renommer
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => startMoving(file)}
                          title="Déplacer"
                        >
                          <i className="fas fa-folder"></i> Déplacer
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(file.id)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Audio Player */}
                <div className="mt-2">
                  <audio 
                    controls 
                    src={file.url || file.data} 
                    className="w-100"
                    style={{ height: '40px' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Move Dialog */}
      {showMoveDialog && selectedFileForMove && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-folder-open me-2"></i>
                  Déplacer "{selectedFileForMove.name}"
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowMoveDialog(false);
                    setSelectedFileForMove(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="list-group">
                  <button
                    className="list-group-item list-group-item-action d-flex align-items-center"
                    onClick={() => handleMove(selectedFileForMove.id, null)}
                  >
                    <i className="fas fa-folder me-2"></i>
                    Dossier racine
                  </button>
                  {folders?.map(folder => (
                    <button
                      key={folder.id}
                      className="list-group-item list-group-item-action d-flex align-items-center"
                      onClick={() => handleMove(selectedFileForMove.id, folder.id)}
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
        .audio-player {
          height: 40px;
          width: 100%;
        }
        .audio-player::-webkit-media-controls-panel {
          background-color: #f8f9fa;
        }
        .modal {
          background-color: rgba(0, 0, 0, 0.5);
        }
        .gap-2 {
          gap: 0.5rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .list-group-item {
          transition: background-color 0.2s;
        }
        .list-group-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
