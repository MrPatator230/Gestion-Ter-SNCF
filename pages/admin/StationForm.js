import React from 'react';

const StationForm = ({
  name,
  setName,
  categories,
  setCategories,
  locationType,
  setLocationType,
  allCategories = [],
  handleCategoryToggle,
  handleSubmit,
  editIndex,
  cancelEdit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="form-group mb-3">
        <label htmlFor="stationName">Nom de la gare</label>
        <input
          type="text"
          id="stationName"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group mb-3">
        <label>Catégories</label>
        <div className="border rounded p-3">
          {allCategories.map((category) => (
            <div key={category} className="form-check form-check-inline me-3 mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id={`category-${category}`}
                checked={categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <label 
                className="form-check-label" 
                htmlFor={`category-${category}`}
                style={{ cursor: 'pointer' }}
              >
                {category}
              </label>
            </div>
          ))}
        </div>
        {categories.length === 0 && (
          <small className="text-danger">Veuillez sélectionner au moins une catégorie</small>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="locationType">Type de lieu</label>
        <select
          id="locationType"
          className="form-control"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
          required
        >
          <option value="Ville">Ville</option>
          <option value="Interurbain">Interurbain</option>
        </select>
      </div>
      
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">
          {editIndex !== null ? 'Modifier la gare' : 'Ajouter la gare'}
        </button>
        {editIndex !== null && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cancelEdit}
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
};

export default StationForm;
