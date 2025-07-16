import React from 'react';

const StationsList = ({
  paginatedStations = [],
  categoryColors = {},
  currentPage,
  pageSize,
  handleEdit,
  handleDelete,
  totalPages,
  goToPreviousPage,
  goToNextPage,
  openMessagePopup,
}) => {
  return (
    <>
      <h2>Liste des gares créées</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nom de la gare</th>
              <th>Catégories</th>
              <th>Type de lieu</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStations.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">Aucune gare créée</td>
              </tr>
            ) : (
              paginatedStations.map((station, index) => (
              <tr key={station?.id || index}>
                <td>{station?.name || 'Nom inconnu'}</td>
                <td>
                  {station?.categories && Array.isArray(station.categories) && station.categories.length > 0 ? (
                    station.categories.map((cat) => (
                      <span key={cat} className={`badge bg-${categoryColors[cat] || 'secondary'} me-1 mb-1`}>
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">Aucune catégorie</span>
                  )}
                </td>
                <td>{station?.locationType || 'Ville'}</td>
                <td>
                  <div className="btn-group" role="group">
                    <button 
                      className="btn btn-sm btn-warning" 
                      onClick={() => handleEdit(station)}
                      title="Modifier"
                    >
                      Modifier
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(station)}
                      title="Supprimer"
                    >
                      Supprimer
                    </button>
                    <button 
                      className="btn btn-sm btn-info" 
                      onClick={() => openMessagePopup(station)}
                      title="Message"
                    >
                      Message
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination des gares">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={goToPreviousPage} disabled={currentPage === 1}>
                Précédent
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                Page {currentPage} sur {totalPages}
              </span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={goToNextPage} disabled={currentPage === totalPages}>
                Suivant
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default StationsList;
