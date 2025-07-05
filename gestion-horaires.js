import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllSchedules, updateSchedule } from '../../utils/scheduleUtils';
import trainTypeLogos from '../data/trainTypeLogos.json';

export default function GestionHoraires() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSchedules(getAllSchedules());
    setLoading(false);
  }, []);

  const handleChange = async (id, field, value) => {
    const updatedSchedule = schedules.find(s => s.id === id);
    if (!updatedSchedule) return;

    const newSchedule = { ...updatedSchedule, [field]: value };

    // If the field is 'track', update the track assignment in the database
    if (field === 'track') {
      try {
        const response = await fetch('/api/track-assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scheduleId: id,
            station: updatedSchedule.departureStation,
            track: value,
          }),
        });
        if (!response.ok) {
          console.error('Failed to update track assignment');
        }
      } catch (error) {
        console.error('Error updating track assignment:', error);
      }
    }

    updateSchedule(id, newSchedule);

    setSchedules(prev =>
      prev.map(s => (s.id === id ? newSchedule : s))
    );
  };

  const handleReset = () => {
    // Reset delays and cancellations for all schedules
    schedules.forEach(schedule => {
      updateSchedule(schedule.id, { delayMinutes: 0, isCancelled: false });
    });
    setSchedules(getAllSchedules());
  };

  if (loading) return <Layout><p>Chargement...</p></Layout>;

  return (
    <Layout>
      <div className="container py-4">
        <h1>Gestion des Horaires</h1>
        <button className="btn btn-danger mb-3" onClick={handleReset}>
          Remettre à zéro retards et suppressions
        </button>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Train</th>
              <th>Départ</th>
              <th>Arrivée</th>
              <th>Quai</th>
              <th>Retard (min)</th>
              <th>Supprimé</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(schedule => {
              const trainType = schedule.trainType || 'TER';
              const logoSrc = trainTypeLogos[trainType] || '/images/sncf-logo.png';
              return (
                <tr key={schedule.id} style={schedule.isCancelled ? { textDecoration: 'line-through', color: 'red' } : {}}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={logoSrc} alt={trainType} style={{ height: '24px', width: 'auto' }} />
                    <span>{schedule.trainNumber}</span>
                  </td>
                  <td>{schedule.departureStation}</td>
                  <td>{schedule.arrivalStation}</td>
                  <td>
                    <input
                      type="text"
                      value={schedule.track || ''}
                      onChange={e => handleChange(schedule.id, 'track', e.target.value)}
                      placeholder="Quai"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={schedule.delayMinutes || 0}
                      onChange={e => handleChange(schedule.id, 'delayMinutes', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!schedule.isCancelled}
                      onChange={e => handleChange(schedule.id, 'isCancelled', e.target.checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .container {
          max-width: 900px;
        }
        input[type="text"], input[type="number"] {
          width: 100px;
        }
      `}</style>
    </Layout>
  );
}
