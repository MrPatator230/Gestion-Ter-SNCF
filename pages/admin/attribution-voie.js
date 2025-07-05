import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../src/contexts/AuthContext';

export default function AttributionVoie() {
  const { role, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  const [stations, setStations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [trackAssignments, setTrackAssignments] = useState({}); // { scheduleId: { stationName: track } }
  const [currentAssignments, setCurrentAssignments] = useState({}); // for selected schedule

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, role, router]);

  useEffect(() => {
    const savedStations = localStorage.getItem('stations');
    if (savedStations) setStations(JSON.parse(savedStations));
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) setSchedules(JSON.parse(savedSchedules));
    const savedTrackAssignments = localStorage.getItem('trackAssignmentsBySchedule');
    if (savedTrackAssignments) setTrackAssignments(JSON.parse(savedTrackAssignments));
  }, []);

  // Filter schedules that serve the selected station
  useEffect(() => {
    if (selectedStation) {
      const filtered = schedules.filter(schedule => {
        if (schedule.departureStation === selectedStation || schedule.arrivalStation === selectedStation) {
          return true;
        }
        if (schedule.servedStations && schedule.servedStations.some(st => st.name === selectedStation)) {
          return true;
        }
        return false;
      });
      setFilteredSchedules(filtered);
      setSelectedScheduleId('');
      setCurrentAssignments({});
    } else {
      setFilteredSchedules([]);
      setSelectedScheduleId('');
      setCurrentAssignments({});
    }
  }, [selectedStation, schedules]);

  // Load current assignments for selected schedule
  useEffect(() => {
    if (selectedScheduleId && trackAssignments[selectedScheduleId]) {
      setCurrentAssignments(trackAssignments[selectedScheduleId]);
    } else {
      setCurrentAssignments({});
    }
  }, [selectedScheduleId, trackAssignments]);

  const handleTrackChange = (stationName, value) => {
    setCurrentAssignments(prev => ({
      ...prev,
      [stationName]: value,
    }));
  };

  const handleSave = () => {
    if (!selectedScheduleId) {
      alert('Veuillez sélectionner un horaire.');
      return;
    }
    const newTrackAssignments = {
      ...trackAssignments,
      [selectedScheduleId]: currentAssignments,
    };
    setTrackAssignments(newTrackAssignments);
    localStorage.setItem('trackAssignmentsBySchedule', JSON.stringify(newTrackAssignments));
    alert('Attribution des voies enregistrée avec succès.');
  };

  const getScheduleById = (id) => schedules.find(s => s.id === Number(id));

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content" className="container mt-4 flex-grow-1">
          <h1>Attribution des voies</h1>

          <div className="mb-3">
            <label htmlFor="stationSelect" className="form-label">Sélectionnez une gare</label>
            <select
              id="stationSelect"
              className="form-select"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              <option value="">-- Choisir une gare --</option>
              {stations.map(station => (
                <option key={station.name} value={station.name}>{station.name}</option>
              ))}
            </select>
          </div>

          {selectedStation && (
            <div className="mb-3">
              <label htmlFor="scheduleSelect" className="form-label">Sélectionnez un horaire</label>
              <select
                id="scheduleSelect"
                className="form-select"
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
              >
                <option value="">-- Choisir un horaire --</option>
                {filteredSchedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.trainNumber} - {schedule.departureStation} → {schedule.arrivalStation}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedScheduleId && (
            <>
              <h3>Liste des arrêts pour l'horaire sélectionné</h3>
              <div className="mb-3">
                {(() => {
                  const schedule = getScheduleById(selectedScheduleId);
                  if (!schedule) return null;
                  const stops = [
                    { name: schedule.departureStation },
                    ...(schedule.servedStations || []),
                    { name: schedule.arrivalStation },
                  ];
                  return stops.map((stop, idx) => (
                    <div key={idx} className="mb-2">
                      <label className="form-label">{stop.name}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Voie de passage"
                        value={currentAssignments[stop.name] || ''}
                        onChange={(e) => handleTrackChange(stop.name, e.target.value)}
                      />
                    </div>
                  ));
                })()}
              </div>
              <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
