import { useState, useEffect } from 'react';

const BLUE_BG = '#cce7ff'; // semi-light blue background

function formatTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function getCurrentTimeInMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getCurrentWeekDay() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  return days[now.getDay()];
}

function getCurrentDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default function Afficheur() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [trackAssignmentsBySchedule, setTrackAssignmentsBySchedule] = useState({}); // { scheduleId: { stationName: track } }
  const [currentDate, setCurrentDate] = useState(getCurrentDateString());

  useEffect(() => {
    const savedStations = localStorage.getItem('stations');
    if (savedStations) setStations(JSON.parse(savedStations));
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) setSchedules(JSON.parse(savedSchedules));
    const savedTrackAssignments = localStorage.getItem('trackAssignmentsBySchedule');
    if (savedTrackAssignments) setTrackAssignmentsBySchedule(JSON.parse(savedTrackAssignments));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = getCurrentDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
      const savedSchedules = localStorage.getItem('schedules');
      if (savedSchedules) setSchedules(JSON.parse(savedSchedules));
      const savedTrackAssignments = localStorage.getItem('trackAssignmentsBySchedule');
      if (savedTrackAssignments) setTrackAssignmentsBySchedule(JSON.parse(savedTrackAssignments));
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, [currentDate]);

  // Helper to get arrival and departure times for selected station in a schedule
  const getTimesForStation = (schedule, stationName) => {
    if (schedule.departureStation === stationName) {
      return { arrivalTime: '', departureTime: schedule.departureTime };
    }
    if (schedule.arrivalStation === stationName) {
      return { arrivalTime: schedule.arrivalTime, departureTime: '' };
    }
    if (schedule.servedStations) {
      const servedStation = schedule.servedStations.find(st => st.name === stationName);
      if (servedStation) {
        return { arrivalTime: servedStation.arrivalTime || '', departureTime: servedStation.departureTime || '' };
      }
    }
    return { arrivalTime: '', departureTime: '' };
  };

  const currentWeekDay = getCurrentWeekDay();
  const currentTime = getCurrentTimeInMinutes();

  // Filter schedules by current day of week and selected station
  const filteredSchedules = schedules.filter(schedule => {
    if (!schedule.joursCirculation || !schedule.joursCirculation.includes(currentWeekDay)) {
      return false;
    }
    if (schedule.departureStation === selectedStation || schedule.arrivalStation === selectedStation) {
      return true;
    }
    if (schedule.servedStations && schedule.servedStations.some(st => st.name === selectedStation)) {
      return true;
    }
    return false;
  });

  // Separate arrivals and departures based on times at selected station and filter out past schedules
  const arrivals = [];
  const departures = [];

  filteredSchedules.forEach(schedule => {
    const times = getTimesForStation(schedule, selectedStation);
    if (times.arrivalTime) {
      const arrivalTimeMinutes = formatTimeToMinutes(times.arrivalTime);
      if (arrivalTimeMinutes !== null && arrivalTimeMinutes >= currentTime) {
        arrivals.push({ schedule, time: times.arrivalTime });
      }
    }
    if (times.departureTime) {
      const departureTimeMinutes = formatTimeToMinutes(times.departureTime);
      if (departureTimeMinutes !== null && departureTimeMinutes >= currentTime) {
        departures.push({ schedule, time: times.departureTime });
      }
    }
  });

  // Sort by time
  arrivals.sort((a, b) => a.time.localeCompare(b.time));
  departures.sort((a, b) => a.time.localeCompare(b.time));

  // Show track 30 minutes before arrival or departure time
  const shouldShowTrack = (timeStr) => {
    const trainTime = formatTimeToMinutes(timeStr);
    if (trainTime === null) return false;
    return currentTime >= trainTime - 30;
  };

  // Helper to get stop status and delay for a schedule and station
  const getStopStatus = (schedule, stationName) => {
    if (schedule.stopStatus && schedule.stopStatus[stationName]) {
      return schedule.stopStatus[stationName];
    }
    return { status: schedule.status || 'on_time', delayMinutes: schedule.delayMinutes || 0 };
  };

  return (
    <div style={{ backgroundColor: BLUE_BG, minHeight: '100vh', padding: '1rem' }}>
      <h1 className="text-center mb-4">Afficheur SNCF - Arrivées et Départs</h1>
      <div className="mb-4">
        <label htmlFor="stationSelect" className="form-label fw-semibold">Sélectionnez une gare</label>
        <select
          id="stationSelect"
          className="form-select form-select-lg"
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
        <>
          <div className="row">
            <div className="col-md-6" style={{ borderRight: '2px solid #007bff', paddingRight: '1rem' }}>
              <h2 className="text-center mb-3" style={{ color: 'green' }}>
                Arrivées <span style={{ fontSize: '1.5rem' }}>🡆</span>
              </h2>
              {arrivals.length === 0 ? (
                <p className="text-center text-muted">Aucune arrivée trouvée pour cette gare.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-bordered text-center align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Train</th>
                        <th>Provenance</th>
                        <th>Heure d'arrivée</th>
                        <th>Voie</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arrivals.map(({ schedule, time }) => {
                        const showTrack = shouldShowTrack(time);
                        const track = showTrack && trackAssignmentsBySchedule[schedule.id]?.[selectedStation] ? trackAssignmentsBySchedule[schedule.id][selectedStation] : '-';
                        const stopStatus = getStopStatus(schedule, selectedStation);
                        let statusText = stopStatus.status === 'on_time' ? 'À l\'heure' : stopStatus.status === 'delayed' ? `En retard (${stopStatus.delayMinutes} min)` : 'Supprimé';
                        return (
                          <tr key={schedule.id} className="fs-5 fw-bold">
                            <td>{schedule.trainNumber}</td>
                            <td>{schedule.departureStation}</td>
                            <td>{time}</td>
                            <td>{track}</td>
                            <td>{statusText}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="col-md-6" style={{ paddingLeft: '1rem' }}>
              <h2 className="text-center mb-3" style={{ color: 'blue' }}>
                Départs <span style={{ fontSize: '1.5rem' }}>🡆</span>
              </h2>
              {departures.length === 0 ? (
                <p className="text-center text-muted">Aucun départ trouvé pour cette gare.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-bordered text-center align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Train</th>
                        <th>Destination</th>
                        <th>Heure de départ</th>
                        <th>Voie</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departures.map(({ schedule, time }) => {
                        const showTrack = shouldShowTrack(time);
                        const track = showTrack && trackAssignmentsBySchedule[schedule.id]?.[selectedStation] ? trackAssignmentsBySchedule[schedule.id][selectedStation] : '-';
                        const stopStatus = getStopStatus(schedule, selectedStation);
                        let statusText = stopStatus.status === 'on_time' ? 'À l\'heure' : stopStatus.status === 'delayed' ? `En retard (${stopStatus.delayMinutes} min)` : 'Supprimé';
                        return (
                          <tr key={schedule.id} className="fs-5 fw-bold">
                            <td>{schedule.trainNumber}</td>
                            <td>{schedule.arrivalStation}</td>
                            <td>{time}</td>
                            <td>{track}</td>
                            <td>{statusText}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {(arrivals.length === 0 && departures.length === 0) && (
            <p className="text-center mt-4 fst-italic">Les prochains départs auront lieu demain</p>
          )}
        </>
      )}
    </div>
  );
}
