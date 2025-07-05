import { useState } from 'react';

export default function FolderList({ folders, selectedFolderId, onSelect, onDelete, onRename }) {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, folderId: null });
  const [editingFolder, setEditingFolder] = useState(null);
  const [newName, setNewName] = useState('');

  const handleContextMenu = (e, folderId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      folderId
    });
  };

  const handleRename = (folderId, currentName) => {
    setEditingFolder(folderId);
    setNewName(currentName);
    setContextMenu({ visible: false, x: 0, y: 0, folderId: null });
  };

  const submitRename = async (folderId) => {
    if (newName.trim()) {
      await onRename(folderId, newName.trim());
      setEditingFolder(null);
      setNewName('');
    }
  };

  const handleDelete = async (folderId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      await onDelete(folderId);
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: null });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, folderId: null });
  };

  return (
    <div className="folder-list" onClick={closeContextMenu}>
      <div className="list-group shadow-sm">
        <button
          className={`list-group-item list-group-item-action d-flex align-items-center ${
            selectedFolderId === null ? 'active' : ''
          }`}
          onClick={() => onSelect(null)}
        >
          <i className="fas fa-folder me-2"></i>
          Tous les fichiers
        </button>

        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`list-group-item list-group-item-action ${
              selectedFolderId === folder.id ? 'active' : ''
            }`}
            onContextMenu={(e) => handleContextMenu(e, folder.id)}
          >
            {editingFolder === folder.id ? (
              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && submitRename(folder.id)}
                  autoFocus
                />
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => submitRename(folder.id)}
                >
                  <i className="fas fa-check"></i>
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => setEditingFolder(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <div
                className="d-flex align-items-center"
                onClick={() => onSelect(folder.id)}
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-folder me-2"></i>
                <span className="flex-grow-1">{folder.name}</span>
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-link text-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, folder.id);
                    }}
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {contextMenu.visible && (
        <div
          className="dropdown-menu show"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000
          }}
        >
          <button
            className="dropdown-item"
            onClick={() => handleRename(contextMenu.folderId, folders.find(f => f.id === contextMenu.folderId)?.name)}
          >
            <i className="fas fa-edit me-2"></i>
            Renommer
          </button>
          <button
            className="dropdown-item text-danger"
            onClick={() => handleDelete(contextMenu.folderId)}
          >
            <i className="fas fa-trash-alt me-2"></i>
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
