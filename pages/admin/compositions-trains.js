import { useState, useEffect, useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from '../../components/Sidebar';
import DraggableRollingStock from '../../components/admin/DraggableRollingStock';
import CompositionDropZone from '../../components/admin/CompositionDropZone';
import TrainVisualSlider from '../../components/TrainVisualSlider';
import { SettingsContext } from '../../contexts/SettingsContext';

export default function CompositionsTrains() {
  const { primaryColor, buttonStyle } = useContext(SettingsContext);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [materielsRoulants, setMaterielsRoulants] = useState([]);
  const [composition, setComposition] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [error, setError] = useState('');
  const [editingMaterielId, setEditingMaterielId] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [showTrainVisual, setShowTrainVisual] = useState(false);

  async function fetchMaterielsRoulants() {
    try {
      const materielsRes = await fetch('/api/materiels-roulants');
      if (materielsRes.ok) {
        const materielsData = await materielsRes.json();
        setMaterielsRoulants(materielsData);
      }
    } catch (error) {
      console.error('Error loading materiels roulants:', error);
    }
  }

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const schedulesRes = await fetch('/api/schedules');
        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json();
          setSchedules(schedulesData);
        }
      } catch (error) {
        console.error('Error loading schedules:', error);
      }
      fetchMaterielsRoulants();
    }
    fetchInitialData();
  }, []);

  const handleTrainNumberSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/schedules/by-train-number?trainNumber=${encodeURIComponent(trainNumber)}`);
      if (!res.ok) {
        setError('Numéro de train non trouvé');
        setSelectedSchedule(null);
        setComposition([]);
        setShowTrainVisual(false);
        return;
      }
      const schedule = await res.json();
      setSelectedSchedule(schedule);
      setComposition(schedule?.composition || []);
      setError('');
      setShowTrainVisual(false);
    } catch (error) {
      console.error('Error fetching schedule by train number:', error);
      setError('Erreur lors de la recherche du numéro de train');
      setSelectedSchedule(null);
      setComposition([]);
      setShowTrainVisual(false);
    }
  };

  const handleDrop = (item) => {
    if (Array.isArray(item)) {
      setComposition(item);
    } else {
      setComposition(prev => [...prev, item]);
    }
    setShowTrainVisual(false);
  };

  const handleSaveComposition = async () => {
    if (!selectedSchedule) {
      alert('Veuillez sélectionner un horaire');
      return;
    }

    try {
      if (!selectedSchedule.train_number || !selectedSchedule.departure_station || !selectedSchedule.arrival_station ||
          !selectedSchedule.arrival_time || !selectedSchedule.departure_time || !selectedSchedule.train_type) {
        alert('Les informations de l\'horaire sont incomplètes. Veuillez vérifier les données.');
        return;
      }

      const payload = {
        trainNumber: selectedSchedule.train_number,
        departureStation: selectedSchedule.departure_station,
        arrivalStation: selectedSchedule.arrival_station,
        arrivalTime: selectedSchedule.arrival_time,
        departureTime: selectedSchedule.departure_time,
        trainType: selectedSchedule.train_type,
        rollingStockFileName: composition.length > 0 ? composition[0].name : null,
        composition: composition,
        joursCirculation: selectedSchedule.jours_circulation || [],
        servedStations: selectedSchedule.served_stations || [],
      };

      const response = await fetch(`/api/schedules/${selectedSchedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Erreur lors de la mise à jour de la composition: ${errorData.error}`);
        return;
      }

      const updatedScheduleRes = await fetch(`/api/schedules/by-train-number?trainNumber=${encodeURIComponent(selectedSchedule.train_number)}`);
      const updatedSchedule = await updatedScheduleRes.json();


      const updatedSchedules = schedules.map(schedule =>
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule
      );
      setSchedules(updatedSchedules);

      setSelectedSchedule(updatedSchedule);
      setShowTrainVisual(true);
      alert('Composition enregistrée avec succès');
    } catch (error) {
      console.error('Error saving composition:', error);
      alert('Erreur lors de l\'enregistrement de la composition');
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleMaterielSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !type.trim()) {
        alert('Veuillez remplir le nom et le type.');
        return;
    }
    if (editingMaterielId === null && !imageFile) {
        alert('Veuillez ajouter une image pour un nouveau matériel.');
        return;
    }

    const processSubmit = async (imageData) => {
        const payload = {
            name: name.trim(),
            type: type.trim(),
            imageData: imageData,
        };

        try {
            const url = editingMaterielId 
                ? `/api/materiels-roulants/${editingMaterielId}`
                : '/api/materiels-roulants';
            
            const method = editingMaterielId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || `Failed to save rolling stock`);
            }

            await fetchMaterielsRoulants();

            setEditingMaterielId(null);
            setName('');
            setType('');
            setImageFile(null);
            e.target.reset();

        } catch (error) {
            console.error(error);
            alert(`Error saving rolling stock: ${error.message}`);
        }
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            processSubmit(reader.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        processSubmit(null);
    }
  };

  const handleEdit = (materiel) => {
    setEditingMaterielId(materiel.id);
    setName(materiel.name);
    setType(materiel.type);
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce matériel roulant ?')) {
      try {
        const response = await fetch(`/api/materiels-roulants/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to delete rolling stock');
        }

        await fetchMaterielsRoulants();

        if (editingMaterielId === id) {
          setEditingMaterielId(null);
          setName('');
          setType('');
          setImageFile(null);
        }
      } catch (error) {
        console.error(error);
        alert(`Error deleting rolling stock: ${error.message}`);
      }
    }
  };

  const getBorderRadius = () => {
    switch (buttonStyle) {
      case 'rounded':
        return '25px';
      case 'square':
        return '0';
      default:
        return '4px';
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
          <div id="content" className="container-fluid py-4">
            <h1 className="h3 mb-4" style={{ color: primaryColor }}>
              Compositions des Trains
            </h1>

            <div className="row">
              <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <form onSubmit={handleTrainNumberSubmit} className="row g-3 align-items-end">
                    <div className="col-md-8">
                      <label className="form-label">Numéro du train</label>
                      <input
                        type="text"
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        value={trainNumber}
                        onChange={(e) => setTrainNumber(e.target.value)}
                        placeholder="Entrez le numéro du train"
                        style={{ borderRadius: getBorderRadius() }}
                      />
                      {error && <div className="invalid-feedback">{error}</div>}
                    </div>
                    <div className="col-md-4">
                      <button
                        type="submit"
                        className="btn w-100"
                        style={{
                          backgroundColor: primaryColor,
                          color: 'white',
                          borderRadius: getBorderRadius()
                        }}
                      >
                        Rechercher
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {selectedSchedule && (
                <>
                  {showTrainVisual && (
                    <div className="card shadow-sm mb-4">
                      <div className="card-body">
                        <h2 className="h5 mb-4" style={{ color: primaryColor }}>
                          Visualisation du Train {selectedSchedule.train_number}
                        </h2>
                        <TrainVisualSlider
                          trainNumber={selectedSchedule.train_number}
                          composition={composition}
                        />
                      </div>
                    </div>
                  )}

                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h2 className="h5 mb-4" style={{ color: primaryColor }}>
                        Composition du Train {selectedSchedule.train_number}
                      </h2>
                      <CompositionDropZone
                        onDrop={handleDrop}
                        composition={composition}
                      />
                      <button
                        onClick={handleSaveComposition}
                        className="btn w-100 mt-3"
                        style={{
                          backgroundColor: primaryColor,
                          color: 'white',
                          borderRadius: getBorderRadius()
                        }}
                      >
                        Enregistrer la Composition
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="h5 mb-4" style={{ color: primaryColor }}>
                    Gestion du Matériel Roulant
                  </h2>
                  
                   <form onSubmit={handleMaterielSubmit} className="mb-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nom</label>
                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nom du matériel"
                          style={{ borderRadius: getBorderRadius() }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Type</label>
                        <input
                          type="text"
                          className="form-control"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          placeholder="Type (ex: Automotrice)"
                          style={{ borderRadius: getBorderRadius() }}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Image</label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={handleFileChange}
                          style={{ borderRadius: getBorderRadius() }}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn mt-3"
                      style={{
                        backgroundColor: primaryColor,
                        color: 'white',
                        borderRadius: getBorderRadius()
                      }}
                    >
                      {editingMaterielId ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                    {editingMaterielId && (
                      <button
                        type="button"
                        className="btn btn-secondary mt-3 ms-2"
                        onClick={() => {
                          setEditingMaterielId(null);
                          setName('');
                          setType('');
                          setImageFile(null);
                        }}
                        style={{ borderRadius: getBorderRadius() }}
                      >
                        Annuler
                      </button>
                    )}
                  </form>

                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Rechercher un matériel roulant..."
                      className="form-control"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: getBorderRadius() }}
                    />
                  </div>

                  <div className="row g-3">
                    {materielsRoulants
                      .filter(materiel =>
                        materiel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        materiel.type?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(materiel => (
                        <div key={materiel.id} className="col-md-6">
                          <DraggableRollingStock 
                            item={{...materiel, imageData: materiel.image_data}}
                            onEdit={() => handleEdit(materiel)}
                            onDelete={() => handleDelete(materiel.id)}
                          />
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              {selectedSchedule && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-4" style={{ color: primaryColor }}>
                    Arrêts desservis
                  </h2>
                  <div className="timeline">
                    {selectedSchedule ? (
                      <>
                        <div className="timeline-item">
                          <div className="timeline-content">
                            <strong style={{ color: primaryColor }}>{selectedSchedule.departure_station}</strong>
                            <div>Départ: {selectedSchedule.departure_time}</div>
                          </div>
                        </div>
                        {selectedSchedule.served_stations && selectedSchedule.served_stations.length > 0 ? (
                          selectedSchedule.served_stations.map((station, index) => (
                            <div key={index} className="timeline-item">
                              <div className="timeline-content">
                                <strong style={{ color: primaryColor }}>{station.name}</strong>
                                <div>Départ: {station.departureTime || '-'}</div>
                              </div>
                            </div>
                          ))
                        ) : null}
                        <div className="timeline-item">
                          <div className="timeline-content">
                            <strong style={{ color: primaryColor }}>{selectedSchedule.arrival_station}</strong>
                            <div>Arrivée: {selectedSchedule.arrival_time}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p>Aucune gare desservie disponible.</p>
                    )}
                  </div>
                </div>
              </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline-item {
          position: relative;
          padding-left: 20px;
          margin-bottom: 1rem;
        }
        .timeline-item:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: ${primaryColor};
        }
        .timeline-item:after {
          content: '';
          position: absolute;
          left: -4px;
          top: 8px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: ${primaryColor};
        }
        .form-control:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 0.25rem ${primaryColor}40;
        }
      `}</style>
    </DndProvider>
  );
}
