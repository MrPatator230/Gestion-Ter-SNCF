import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

// Helper function to format time string "HH:mm" to 'HH"h"mm'
const formatTimeHHhmmQuoted = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};

export default function StationSchedule() {
  const router = useRouter();
  const { station } = router.query;

  const [departures, setDepartures] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!station) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/schedules/by-station?station=${encodeURIComponent(station)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch schedules');
        }
        const data = await response.json();
        const normalize = (str) => str?.trim().toLowerCase();
        const normalizedStation = normalize(station);

        const filteredDepartures = data.filter(schedule =>
          normalize(schedule.departureStation) === normalizedStation ||
          (Array.isArray(schedule.servedStations) && schedule.servedStations.some(s => normalize(s.name) === normalizedStation && s.departureTime))
        );

        const filteredArrivals = data.filter(schedule =>
          normalize(schedule.arrivalStation) === normalizedStation ||
          (Array.isArray(schedule.servedStations) && schedule.servedStations.some(s => normalize(s.name) === normalizedStation && s.arrivalTime))
        );

        setDepartures(filteredDepartures);
        setArrivals(filteredArrivals);
      } catch (err) {
        setError(err.message);
        setDepartures([]);
        setArrivals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [station]);

  return (
    <Layout>
      <div className="container py-4">
        <h1>Horaires pour la gare: {station}</h1>

        {loading && <p>Chargement des horaires...</p>}
        {error && <p className="text-danger">Erreur: {error}</p>}

        {!loading && !error && (
          <>
            <h2>Départs</h2>
            {departures.length === 0 ? (
              <p>Aucun départ trouvé pour cette gare.</p>
            ) : (
              <table className="table table-striped mb-4">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Train</th>
                    <th>Destination</th>
                    <th>Voie</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {departures.map(schedule => {
                    const normalize = (str) => str?.trim().toLowerCase();
                    const normalizedStation = normalize(station);
                    let time = schedule.departureTime;
                    if (normalize(schedule.departureStation) !== normalizedStation && Array.isArray(schedule.servedStations)) {
                      const served = schedule.servedStations.find(s => normalize(s.name) === normalizedStation);
                      if (served && served.departureTime) {
                        time = served.departureTime;
                      }
                    }
                    const destination = schedule.arrivalStation;
                    const status = schedule.isCancelled ? 'Supprimé' : (schedule.delayMinutes ? `Retard ${schedule.delayMinutes} min` : 'À l\'heure');

                    return (
                      <tr key={schedule.id}>
                        <td>{formatTimeHHhmmQuoted(time) || '-'}</td>
                        <td>{schedule.trainNumber}</td>
                        <td>{destination}</td>
                        <td>{schedule.track || '-'}</td>
                        <td>{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <h2>Arrivées</h2>
            {arrivals.length === 0 ? (
              <p>Aucune arrivée trouvée pour cette gare.</p>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Train</th>
                    <th>Provenance</th>
                    <th>Voie</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {arrivals.map(schedule => {
                    const normalize = (str) => str?.trim().toLowerCase();
                    const normalizedStation = normalize(station);
                    let time = schedule.arrivalTime;
                    if (normalize(schedule.arrivalStation) !== normalizedStation && Array.isArray(schedule.servedStations)) {
                      const served = schedule.servedStations.find(s => normalize(s.name) === normalizedStation);
                      if (served && served.arrivalTime) {
                        time = served.arrivalTime;
                      }
                    }
                    const origin = schedule.departureStation;
                    const status = schedule.isCancelled ? 'Supprimé' : (schedule.delayMinutes ? `Retard ${schedule.delayMinutes} min` : 'À l\'heure');

                    return (
                      <tr key={schedule.id}>
                        <td>{formatTimeHHhmmQuoted(time) || '-'}</td>
                        <td>{schedule.trainNumber}</td>
                        <td>{origin}</td>
                        <td>{schedule.track || '-'}</td>
                        <td>{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
