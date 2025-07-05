import { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ScheduleSearchForm({ onSearch }) {
  const [stations, setStations] = useState([]);
  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [via, setVia] = useState('');
  const [showVia, setShowVia] = useState(false);

  useEffect(() => {
    // Charger les stations depuis le localStorage
    const savedStations = localStorage.getItem('stations');
    if (savedStations) {
      setStations(JSON.parse(savedStations));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      departureStation,
      arrivalStation,
      via: showVia ? via : null,
      departureDate,
      returnDate: returnDate || null
    });
  };

  // Calculer la date minimale (aujourd'hui) et maximale (dans 3 mois)
  const today = new Date();
  const maxDate = addMonths(today, 3);
  const minDateStr = format(today, 'yyyy-MM-dd');
  const maxDateStr = format(maxDate, 'yyyy-MM-dd');

  return (
    <form onSubmit={handleSubmit} className="sncf-card">
      <div className="sncf-card-body">
        <div className="row g-4">
          {/* Gare de départ */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                <span className="material-icons align-middle me-2">place</span>
                Gare de départ
              </label>
              <select 
                className="form-select"
                value={departureStation}
                onChange={(e) => setDepartureStation(e.target.value)}
                required
              >
                <option value="">Sélectionnez une gare</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gare d'arrivée */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                <span className="material-icons align-middle me-2">place</span>
                Gare d'arrivée
              </label>
              <select 
                className="form-select"
                value={arrivalStation}
                onChange={(e) => setArrivalStation(e.target.value)}
                required
              >
                <option value="">Sélectionnez une gare</option>
                {stations.map((station) => (
                  <option 
                    key={station.id} 
                    value={station.id}
                    disabled={station.id === departureStation}
                  >
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Via (optionnel) */}
          <div className="col-12">
            <button
              type="button"
              className="btn btn-link text-primary p-0"
              onClick={() => setShowVia(!showVia)}
            >
              <span className="material-icons align-middle me-1">
                {showVia ? 'remove_circle' : 'add_circle'}
              </span>
              Via
            </button>
            {showVia && (
              <div className="mt-3">
                <select 
                  className="form-select"
                  value={via}
                  onChange={(e) => setVia(e.target.value)}
                >
                  <option value="">Sélectionnez une gare intermédiaire</option>
                  {stations.map((station) => (
                    <option 
                      key={station.id} 
                      value={station.id}
                      disabled={
                        station.id === departureStation || 
                        station.id === arrivalStation
                      }
                    >
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date aller */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                <span className="material-icons align-middle me-2">event</span>
                Aller
              </label>
              <input
                type="date"
                className="form-control"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={minDateStr}
                max={maxDateStr}
                required
              />
            </div>
          </div>

          {/* Date retour (optionnel) */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                <span className="material-icons align-middle me-2">event</span>
                Retour (optionnel)
              </label>
              <input
                type="date"
                className="form-control"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate || minDateStr}
                max={maxDateStr}
              />
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100">
              <span className="material-icons align-middle me-2">search</span>
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
