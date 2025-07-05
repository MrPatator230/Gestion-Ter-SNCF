import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../src/contexts/AuthContext';

const STATUS_TYPES = [
  { value: 'on_time', label: 'À l\'heure' },
  { value: 'delayed', label: 'En retard' },
  { value: 'cancelled', label: 'Supprimé' },
];

export default function TypeHoraires() {
  const { role, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  const [schedules, setSchedules] = useState([]);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({}); // { scheduleId: { status, delayMinutes, stopStatus } }
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showStopsModal, setShowStopsModal] = useState(false);
  const [stopStatusUpdates, setStopStatusUpdates] = useState({}); // { stopName: { status, delayMinutes } }

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, role, router]);

  useEffect(() => {
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) {
      const schedulesData = JSON.parse(savedSchedules);
      setSchedules(schedulesData);
      // Initialize statusUpdates from schedules
      const initialStatus = {};
      schedulesData.forEach(s => {
        initialStatus[s.id] = {
          status: s.status || 'on_time',
          delayMinutes: s.delayMinutes || 0,
          stopStatus: s.stopStatus || {}, // per stop status
        };
      });
      setStatusUpdates(initialStatus);
    }
  }, []);

  const saveSchedules = (newSchedules) => {
    setSchedules(newSchedules);
    localStorage.setItem('schedules', JSON.stringify(newSchedules));
  };

  const handleStatusChange = (scheduleId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        status: newStatus,
        delayMinutes: newStatus === 'delayed' ? (prev[scheduleId]?.delayMinutes || 0) : 0,
      },
    }));
  };

  const handleDelayChange = (scheduleId, newDelay) => {
    const delayInt = parseInt(newDelay, 10);
    if (isNaN(delayInt) || delayInt < 0) return;
    setStatusUpdates(prev => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        delayMinutes: delayInt,
      },
    }));
  };

  const handleSave = (scheduleId) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId) {
        return {
          ...s,
          status: statusUpdates[scheduleId]?.status || 'on_time',
          delayMinutes: statusUpdates[scheduleId]?.delayMinutes || 0,
          stopStatus: statusUpdates[scheduleId]?.stopStatus || {},
        };
      }
      return s;
    });
    saveSchedules(updatedSchedules);
    setEditingScheduleId(null);
  };

  const openStopsModal = (schedule) => {
    setSelectedSchedule(schedule);
    const stopStatus = statusUpdates[schedule.id]?.stopStatus || {};
    setStopStatusUpdates(stopStatus);
    setShowStopsModal(true);
  };

  const closeStopsModal = () => {
    setShowStopsModal(false);
    setSelectedSchedule(null);
    setStopStatusUpdates({});
  };

  const handleStopStatusChange = (stopName, newStatus) => {
    setStopStatusUpdates(prev => ({
      ...prev,
      [stopName]: {
        ...prev[stopName],
        status: newStatus,
        delayMinutes: newStatus === 'delayed' ? (prev[stopName]?.delayMinutes || 0) : 0,
      },
    }));
  };

  const handleStopDelayChange = (stopName, newDelay) => {
    const delayInt = parseInt(newDelay, 10);
    if (isNaN(delayInt) || delayInt < 0) return;

    setStopStatusUpdates(prev => {
      // Propagate delay to all stops with the same delay value
      const updated = {};
      Object.keys(prev).forEach(stop => {
        updated[stop] = {
          status: delayInt > 0 ? 'delayed' : 'on_time',
          delayMinutes: delayInt,
        };
      });
      return updated;
    });
  };

  const saveStopStatus = () => {
    if (!selectedSchedule) return;
    setStatusUpdates(prev => ({
      ...prev,
      [selectedSchedule.id]: {
        ...prev[selectedSchedule.id],
        stopStatus: stopStatusUpdates,
      },
    }));
    // Also update schedules array
    const updatedSchedules = schedules.map(s => {
      if (s.id === selectedSchedule.id) {
        return {
          ...s,
          stopStatus: stopStatusUpdates,
        };
      }
      return s;
    });
    saveSchedules(updatedSchedules);
    closeStopsModal();
  };

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content" className="container mt-4 flex-grow-1">
          <h1>Gestion des types d'horaires</h1>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Numéro du Train</th>
                <th>Gare de Provenance</th>
                <th>Gare de Destination</th>
                <th>Heure de Départ</th>
                <th>Type</th>
                <th>Cause / Minutes de retard</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Aucun horaire disponible</td>
                </tr>
              ) : (
                schedules.map(schedule => {
                  const isEditing = editingScheduleId === schedule.id;
                  const status = statusUpdates[schedule.id]?.status || 'on_time';
                  const delayMinutes = statusUpdates[schedule.id]?.delayMinutes || 0;
                  return (
                    <tr key={schedule.id} onClick={() => openStopsModal(schedule)} style={{ cursor: 'pointer' }}>
                      <td>{schedule.trainNumber}</td>
                      <td>{schedule.departureStation}</td>
                      <td>{schedule.arrivalStation}</td>
                      <td>{schedule.departureTime}</td>
                      <td>
                        {isEditing ? (
                          <select
                            className="form-select"
                            value={status}
                            onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                          >
                            {STATUS_TYPES.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        ) : (
                          STATUS_TYPES.find(t => t.value === status)?.label || 'À l\'heure'
                        )}
                      </td>
                      <td>
                        {isEditing && status === 'delayed' ? (
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={delayMinutes}
                            onChange={(e) => handleDelayChange(schedule.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          status === 'delayed' ? `${delayMinutes} min` : '-'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <>
                            <button className="btn btn-sm btn-success me-2" onClick={(e) => { e.stopPropagation(); handleSave(schedule.id); }}>Enregistrer</button>
                            <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); setEditingScheduleId(null); }}>Annuler</button>
                          </>
                        ) : (
                          <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setEditingScheduleId(schedule.id); }}>Modifier</button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {showStopsModal && selectedSchedule && (
            <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Gestion des arrêts pour le train {selectedSchedule.trainNumber}</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={closeStopsModal}></button>
                  </div>
                  <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Gare</th>
                          <th>Statut</th>
                          <th>Minutes de retard</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSchedule.servedStations && selectedSchedule.servedStations.map((stop, idx) => {
                          const stopName = stop.name;
                          const stopStatus = stopStatusUpdates[stopName]?.status || 'on_time';
                          const stopDelay = stopStatusUpdates[stopName]?.delayMinutes || 0;
                          return (
                            <tr key={idx}>
                              <td>{stopName}</td>
                              <td>
                                <select
                                  className="form-select"
                                  value={stopStatus}
                                  onChange={(e) => handleStopStatusChange(stopName, e.target.value)}
                                >
                                  {STATUS_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                {stopStatus === 'delayed' ? (
                                  <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    value={stopDelay}
                                    onChange={(e) => handleStopDelayChange(stopName, e.target.value)}
                                  />
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-primary" onClick={saveStopStatus}>Enregistrer</button>
                    <button className="btn btn-secondary" onClick={closeStopsModal}>Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
