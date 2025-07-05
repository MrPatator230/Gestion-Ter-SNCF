import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import StationSearchForm from '../../components/StationSearchForm';

export default function StationSchedule() {
  const router = useRouter();
  const { station } = router.query;
  const [scheduleType, setScheduleType] = useState('departures');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (station) {
      const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const stationSchedules = savedSchedules.filter(schedule => 
        schedule.departureStation === decodeURIComponent(station) ||
        schedule.arrivalStation === decodeURIComponent(station) ||
        schedule.servedStations?.some(served => 
          typeof served === 'object' ? 
            served.name === decodeURIComponent(station) : 
            served === decodeURIComponent(station)
        )
      );
      setSchedules(stationSchedules);
      setLoading(false);
    }
  }, [station]);

  const filteredSchedules = schedules.filter(schedule => {
    const stationName = decodeURIComponent(station);
    if (scheduleType === 'departures') {
      return schedule.departureStation === stationName || 
             schedule.servedStations?.some(served => 
               typeof served === 'object' ? 
                 served.name === stationName && served.departureTime : 
                 served === stationName
             );
    } else {
      return schedule.arrivalStation === stationName || 
             schedule.servedStations?.some(served => 
               typeof served === 'object' ? 
                 served.name === stationName && served.arrivalTime : 
                 served === stationName
             );
    }
  });

  const getStatusClass = (status) => {
    if (status === 'À l\'heure') return 'text-success';
    if (status?.includes('Retard')) return 'text-warning';
    return 'text-success';
  };

  const getScheduleTime = (schedule) => {
    const stationName = decodeURIComponent(station);
    if (scheduleType === 'departures') {
      if (schedule.departureStation === stationName) {
        return schedule.departureTime;
      }
      const servedStation = schedule.servedStations?.find(served => 
        typeof served === 'object' ? 
          served.name === stationName : 
          served === stationName
      );
      return typeof servedStation === 'object' ? servedStation.departureTime : schedule.departureTime;
    } else {
      if (schedule.arrivalStation === stationName) {
        return schedule.arrivalTime;
      }
      const servedStation = schedule.servedStations?.find(served => 
        typeof served === 'object' ? 
          served.name === stationName : 
          served === stationName
      );
      return typeof servedStation === 'object' ? servedStation.arrivalTime : schedule.arrivalTime;
    }
  };

  const getDestination = (schedule) => {
    if (scheduleType === 'departures') {
      return schedule.arrivalStation;
    } else {
      return schedule.departureStation;
    }
  };

  if (!station) return null;

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <nav className="breadcrumb bg-transparent">
              <span className="breadcrumb-item">
                <i className="icons-home icons-size-1x5" aria-hidden="true"></i>
              </span>
              <a href="/horaires-par-gare" className="breadcrumb-item">Horaires par gare</a>
              <span className="breadcrumb-item active">{decodeURIComponent(station)}</span>
            </nav>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <StationSearchForm />
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h1 className="h4 mb-0">
                    <i className="icons-station icons-size-1x5 mr-2" aria-hidden="true"></i>
                    Horaires {scheduleType === 'departures' ? 'des départs' : 'des arrivées'} - {decodeURIComponent(station)}
                  </h1>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${scheduleType === 'departures' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setScheduleType('departures')}
                    >
                      <i className="icons-clock-forward mr-2" aria-hidden="true"></i>
                      Départs
                    </button>
                    <button
                      type="button"
                      className={`btn ${scheduleType === 'arrivals' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setScheduleType('arrivals')}
                    >
                      <i className="icons-clock-back mr-2" aria-hidden="true"></i>
                      Arrivées
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Chargement...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger m-3" role="alert">
                    {error}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Heure</th>
                          <th>{scheduleType === 'departures' ? 'Destination' : 'Provenance'}</th>
                          <th>Train</th>
                          <th>Type</th>
                          <th>Jours</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSchedules.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              Aucun horaire trouvé pour cette gare
                            </td>
                          </tr>
                        ) : (
                          filteredSchedules.map(schedule => (
                            <tr key={schedule.id}>
                              <td className="font-weight-bold">{getScheduleTime(schedule)}</td>
                              <td>{getDestination(schedule)}</td>
                              <td>{schedule.trainNumber}</td>
                              <td>
                                <span className="badge badge-primary">
                                  {schedule.trainType}
                                </span>
                              </td>
                              <td>
                                <small>{schedule.joursCirculation?.join(', ') || 'Tous les jours'}</small>
                              </td>
                              <td>
                                <span className={getStatusClass(schedule.status)}>
                                  <i className="icons-check mr-1" aria-hidden="true"></i>
                                  À l'heure
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border-radius: 8px;
        }

        .table th {
          border-top: none;
          background-color: #f8f9fa;
        }

        .badge {
          font-size: 0.875rem;
          padding: 0.5em 0.75em;
        }

        .icons-size-1x5 {
          font-size: 1.5rem;
          vertical-align: middle;
        }

        .breadcrumb {
          padding: 1rem 0;
        }

        .btn-group .btn {
          padding: 0.5rem 1rem;
        }

        .badge-primary {
          background-color: #00a1e5;
        }
      `}</style>
    </Layout>
  );
}
