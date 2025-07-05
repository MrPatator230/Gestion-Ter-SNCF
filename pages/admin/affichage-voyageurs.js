import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import { getStationSchedules, filterSchedulesByType, sortSchedulesByTime } from '../../utils/scheduleUtils';
import StationSearchForm from '../../components/StationSearchForm';

export default function AffichageVoyageursAdmin() {
  const router = useRouter();

  const [displayType, setDisplayType] = useState('');
  const [step, setStep] = useState(1); // 1: choose display type, 2: choose station and show schedules
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    // Load stations from localStorage (same as pages/stations.js)
    const savedStations = localStorage.getItem('stations');
    if (savedStations) {
      setStations(JSON.parse(savedStations));
    }
  }, []);

  const handleDisplayTypeSubmit = (e) => {
    e.preventDefault();
    if (displayType) {
      setStep(2);
    }
  };

  const handleStationChange = (e) => {
    setSelectedStation(e.target.value);
  };

  useEffect(() => {
    if (selectedStation && displayType) {
      const stationSchedules = getStationSchedules(selectedStation);
      const filtered = filterSchedulesByType(stationSchedules, selectedStation, displayType);
      const sorted = sortSchedulesByTime(filtered, selectedStation, displayType);
      setSchedules(sorted);
    } else {
      setSchedules([]);
    }
  }, [selectedStation, displayType]);

  const publicUrl = selectedStation && displayType
    ? `/afficheurs?type=${displayType}&gare=${encodeURIComponent(selectedStation)}`
    : null;

  return (
    <Layout>
      <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
          <div id="content" className="container mt-4 flex-grow-1">
            <h1>Affichage Voyageurs - Admin</h1>

            {step === 1 && (
              <form onSubmit={handleDisplayTypeSubmit} className="mb-4">
                <div className="form-group mb-3">
                  <label htmlFor="displayType">Type de tableau d'affichage</label>
                  <select
                    id="displayType"
                    className="form-control"
                    value={displayType}
                    onChange={(e) => setDisplayType(e.target.value)}
                    required
                  >
                    <option value="">-- Choisir --</option>
                    <option value="departures">Départs</option>
                    <option value="arrivals">Arrivées</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Valider</button>
              </form>
            )}

            {step === 2 && (
              <>
                <div className="mb-3">
                  <label htmlFor="stationSelect">Choisir une gare</label>
                  <select
                    id="stationSelect"
                    className="form-control"
                    value={selectedStation}
                    onChange={handleStationChange}
                    required
                  >
                    <option value="">-- Choisir une gare --</option>
                    {stations.map((station, index) => (
                      <option key={index} value={station.name}>{station.name}</option>
                    ))}
                  </select>
                </div>

                {selectedStation && (
                  <>
                    <h2>Horaires {displayType === 'departures' ? 'des départs' : 'des arrivées'} - {selectedStation}</h2>
                    {schedules.length === 0 ? (
                      <p>Aucun horaire trouvé pour cette gare.</p>
                    ) : (
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Heure</th>
                            <th>Destination</th>
                            <th>Train</th>
                            <th>Quai</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedules.map((schedule) => (
                            <tr key={schedule.id}>
                              <td>{displayType === 'departures' ? schedule.departureTime : schedule.arrivalTime}</td>
                              <td>{displayType === 'departures' ? schedule.arrivalStation : schedule.departureStation}</td>
                              <td>{schedule.trainNumber}</td>
                              <td>{schedule.track || '-'}</td>
                              <td>{schedule.status || 'À l\'heure'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <p>
                      URL publique: {' '}
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer">{publicUrl}</a>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
