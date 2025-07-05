import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import StationForm from './StationForm';
import StationsList from './StationsList';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [locationType, setLocationType] = useState('Ville'); // default to Ville
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const allCategories = ['TER', 'TGV', 'Intercités', 'FRET', 'Autres'];

  const categoryColors = {
    TER: 'primary',
    TGV: 'danger',
    Intercités: 'success',
    FRET: 'warning',
    Autres: 'secondary',
  };

  const pageSize = 10;
  const totalPages = Math.ceil(stations.length / pageSize);

  // Message popup state
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchStations() {
      try {
        const res = await fetch('/api/stations');
        if (res.ok) {
          const data = await res.json();
          setStations(data);
        }
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      }
    }
    fetchStations();
  }, []);

  const saveStations = async (stationsToSave) => {
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stationsToSave),
      });
      if (!res.ok) {
        alert('Erreur lors de l\'enregistrement des gares.');
      }
    } catch (error) {
      alert('Erreur lors de l\'enregistrement des gares.');
    }
  };

  const openPopup = (station) => {
    setSelectedStation(station);
    setMessage(station.message || '');
    setError(null);
    setSuccess(null);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedStation(null);
    setMessage('');
    setError(null);
    setSuccess(null);
  };

  const saveMessage = async () => {
    if (!selectedStation) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/stations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStation.id, message }),
      });
      if (!response.ok) {
        throw new Error('Failed to save message');
      }
      setSuccess('Message enregistré avec succès');
      // Update stations state with new message
      setStations((prevStations) =>
        prevStations.map((st) =>
          st.id === selectedStation.id ? { ...st, message } : st
        )
      );
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || categories.length === 0) return;

    if (editIndex !== null) {
      // Update existing station
      const updatedStations = [...stations];
      updatedStations[editIndex] = { name, categories, locationType };
      setStations(updatedStations);
      saveStations(updatedStations);
      setEditIndex(null);
    } else {
      // Add new station
      const updatedStations = [...stations, { name, categories, locationType }];
      setStations(updatedStations);
      saveStations(updatedStations);
    }
    setName('');
    setCategories([]);
    setLocationType('Ville');
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setCategories(selected);
  };

  const handleEdit = (index) => {
    const station = stations[index];
    setName(station.name);
    setCategories(station.categories);
    setLocationType(station.locationType || 'Ville');
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedStations = stations.filter((_, i) => i !== index);
    setStations(updatedStations);
    saveStations(updatedStations);
    if (editIndex === index) {
      setName('');
      setCategories([]);
      setEditIndex(null);
    }
    // Adjust current page if needed
    if ((updatedStations.length <= (currentPage - 1) * pageSize) && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedStations = stations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const cancelEdit = () => {
    setName('');
    setCategories([]);
    setEditIndex(null);
  };

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content" className="container mt-4 flex-grow-1">
          <h1>Gestion de gares</h1>
          <StationForm
            name={name}
            setName={setName}
            categories={categories}
            setCategories={setCategories}
            locationType={locationType}
            setLocationType={setLocationType}
            allCategories={allCategories}
            handleCategoryChange={handleCategoryChange}
            handleSubmit={handleSubmit}
            editIndex={editIndex}
            cancelEdit={cancelEdit}
          />
          <StationsList
            paginatedStations={paginatedStations}
            categoryColors={categoryColors}
            currentPage={currentPage}
            pageSize={pageSize}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            totalPages={totalPages}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            openMessagePopup={openPopup}
          />
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050,
        }}>
          <div className="popup-content" style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
          }}>
            <h3 id="popup-title">Message pour la gare: {selectedStation?.name}</h3>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Entrez le message à diffuser"
              disabled={saving}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={saveMessage} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button className="btn btn-secondary" onClick={closePopup} disabled={saving}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
