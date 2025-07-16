import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import StationForm from './StationForm';
import StationsList from './StationsList';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [locationType, setLocationType] = useState('Ville');
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [allCategories, setAllCategories] = useState(['TER', 'TGV', 'Intercités', 'FRET', 'Autres']);

  const categoryColors = {
    TER: 'primary',
    TGV: 'danger',
    Intercités: 'success',
    FRET: 'warning',
    Autres: 'secondary',
  };

  const pageSize = 10;

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStations.length / pageSize);

  // Message popup state
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = async () => {
    try {
      const stationsRes = await fetch('/api/stations');
      
      if (stationsRes.ok) {
        const data = await stationsRes.json();
        setStations(data);
      }

      // Essayer de récupérer les catégories depuis l'API
      try {
        const categoriesRes = await fetch('/api/station-types');
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          if (data && data.length > 0) {
            setAllCategories(data.map(c => c.name));
          }
        }
      } catch (error) {
        console.log('Utilisation des catégories par défaut');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDownloadSample = async () => {
    try {
      const response = await fetch('/api/stations/download-sample');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "exemple-gares.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Erreur lors du téléchargement du fichier d'exemple.");
      }
    } catch (error) {
      console.error('Error downloading sample file:', error);
      alert("Une erreur est survenue lors du téléchargement.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/stations/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Importation réussie: ${result.created} gares créées, ${result.updated} mises à jour.`);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erreur lors de l'importation: ${error.message}`);
      }
    } catch (error) {
      console.error('Error importing stations:', error);
      alert("Une erreur est survenue lors de l'importation.");
    }

    e.target.value = null;
  };

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
    setMessage(station?.message || '');
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
      const updatedStations = [...stations];
      updatedStations[editIndex] = { ...stations[editIndex], name, categories, locationType };
      setStations(updatedStations);
      saveStations(updatedStations);
      setEditIndex(null);
    } else {
      const updatedStations = [...stations, { name, categories, locationType }];
      setStations(updatedStations);
      saveStations(updatedStations);
    }
    setName('');
    setCategories([]);
    setLocationType('Ville');
  };

  const handleCategoryToggle = (category) => {
    setCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleEdit = (station) => {
    if (!station) return;
    const originalIndex = stations.findIndex(s => s.id === station.id);
    if (originalIndex === -1) return;

    setName(station.name || '');
    setCategories(station.categories || []);
    setLocationType(station.locationType || 'Ville');
    setEditIndex(originalIndex);
  };

  const handleDelete = (station) => {
    if (!station) return;

    const updatedStations = stations.filter(s => s.id !== station.id);
    setStations(updatedStations);
    saveStations(updatedStations);

    if (editIndex !== null && stations[editIndex]?.id === station.id) {
      cancelEdit();
    }

    const newTotalPages = Math.ceil(
      filteredStations.filter(s => s.id !== station.id).length / pageSize
    );
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(newTotalPages, 1));
    }
  };

  const paginatedStations = filteredStations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher une gare..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mb-3 d-flex">
            <button className="btn btn-info me-2" onClick={handleImportClick}>
              Importer des gares
            </button>
            <button className="btn btn-outline-info me-3" onClick={handleDownloadSample}>
              Télécharger un exemple
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".xlsx, .xls"
            />
          </div>
          <StationForm
            name={name}
            setName={setName}
            categories={categories}
            setCategories={setCategories}
            locationType={locationType}
            setLocationType={setLocationType}
            allCategories={allCategories}
            handleCategoryToggle={handleCategoryToggle}
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
