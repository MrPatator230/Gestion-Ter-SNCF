import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TrainVisualSlider from '../components/TrainVisualSlider';
import { getAllSchedules, getDelayedTime } from '../utils/scheduleUtils';
import { useTrackAssignments } from '../hooks/useTrackAssignments';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function VerificationTrajets() {
  const router = useRouter();
  const [trainNumber, setTrainNumber] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  const { trackAssignments } = useTrackAssignments();

  // Train icon SVG
  const trainIcon = `<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="css-1argc29"><path d="M16.1496 17.1591C16.2075 17.1153 16.2654 17.0824 16.3117 17.0386C16.8094 16.6554 17.284 16.075 17.6197 15.1661C18.0943 13.8958 18.4299 12.757 18.5225 11.3553C18.6499 9.62509 17.8975 6.9422 17.3998 5.69384L17.2261 5.25582C17.122 4.9711 16.7053 4.37977 15.9876 3.65703C15.3625 3.0438 14.7606 3 13.8578 3H10.1538C9.23936 3 8.64903 3.0438 8.02398 3.65703C7.29475 4.36882 6.88962 4.9711 6.78545 5.25582L6.61182 5.69384C6.1141 6.9422 5.36172 9.62509 5.48905 11.3553C5.58165 12.757 5.91732 13.8849 6.3919 15.1661C6.72757 16.075 7.19058 16.6663 7.69988 17.0386C7.74618 17.0715 7.80405 17.1153 7.86193 17.1591L5.16494 19.9953C4.94502 20.2252 4.94502 20.5976 5.16494 20.8275C5.38487 21.0575 5.7437 21.0575 5.95205 20.8275L6.87805 19.8529H17.122L18.048 20.8275C18.2679 21.0575 18.6151 21.0575 18.8351 20.8275C19.055 20.5976 19.055 20.2252 18.8351 19.9953L16.1496 17.1591ZM15.2468 16.1297C14.7375 16.1297 14.3208 15.7355 14.3208 15.2537C14.3208 14.7719 14.7375 14.3776 15.2468 14.3776C15.7561 14.3776 16.1728 14.7719 16.1728 15.2537C16.1728 15.7355 15.7561 16.1297 15.2468 16.1297ZM6.86647 10.5121C6.2993 10.5121 7.19057 5.8143 7.5957 5.8143H16.3001C16.74 5.8143 17.7702 10.5121 17.0757 10.5121H6.86647ZM7.80405 15.2537C7.80405 14.7719 8.22075 14.3776 8.73005 14.3776C9.23936 14.3776 9.65606 14.7719 9.65606 15.2537C9.65606 15.7355 9.23936 16.1297 8.73005 16.1297C8.22075 16.1297 7.80405 15.7355 7.80405 15.2537ZM8.00083 18.6703L8.99628 17.63C9.48243 17.7395 9.92228 17.7395 10.2464 17.7395H13.7536C14.0777 17.7395 14.5291 17.7395 15.0037 17.63L15.9992 18.6703H8.00083Z"></path></svg>`;

  useEffect(() => {
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCompanyLogo(settings.logoUrl || '');
    }

    if (router.query.numero) {
      setTrainNumber(router.query.numero);
      searchTrain(router.query.numero);
    }

    const interval = setInterval(() => {
      if (router.query.numero) {
        searchTrain(router.query.numero);
        updateTrainPosition();
      }
    }, 30000);

    // Update train position every minute
    const positionInterval = setInterval(updateTrainPosition, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(positionInterval);
    };
  }, [router.query]);

  const searchTrain = async (number) => {
    setLoading(true);
    setError('');
    setSchedule(null);

    try {
      const schedules = getAllSchedules();
      const found = schedules.find(s => s.trainNumber === number);

      if (found) {
        setSchedule(found);
        updateTrainPosition();
      } else {
        setError('Train non trouvé. Veuillez vérifier le numéro.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trainNumber) {
      router.push({
        pathname: '/verification-trajets',
        query: { numero: trainNumber }
      });
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return time;
  };

  const getTrackForStation = (scheduleId, stationName) => {
    if (!schedule) return null;
    return trackAssignments[scheduleId]?.[stationName] || '-';
  };

  const updateTrainPosition = () => {
    if (!schedule) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    const stops = getStops();
    let position = null;

    // Check if we're exactly at a station time
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      
      if (stop.type === 'intermediate') {
        if (currentTimeStr === stop.arrivalTime || currentTimeStr === stop.departureTime) {
          position = { type: 'at-station', index: i };
          break;
        }
      } else if (currentTimeStr === stop.time) {
        position = { type: 'at-station', index: i };
        break;
      }
    }

    // If not at a station, check if we're between stations
    if (!position) {
      for (let i = 0; i < stops.length - 1; i++) {
        const currentStop = stops[i];
        const nextStop = stops[i + 1];
        
        const departureTime = currentStop.type === 'intermediate' ? 
          currentStop.departureTime : currentStop.time;
        const arrivalTime = nextStop.type === 'intermediate' ? 
          nextStop.arrivalTime : nextStop.time;

        if (isTimeBetween(currentTimeStr, departureTime, arrivalTime)) {
          position = { type: 'between-stations', fromIndex: i, toIndex: i + 1 };
          break;
        }
      }
    }

    setCurrentPosition(position);
  };

  const isTimeBetween = (current, start, end) => {
    const [currentHour, currentMin] = current.split(':').map(Number);
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const getStops = () => {
    if (!schedule) return [];

    const stops = [];

    // Départ
    stops.push({
      station: schedule.departureStation,
      time: schedule.departureTime,
      type: 'departure',
      voie: getTrackForStation(schedule.id, schedule.departureStation, schedule.departureTime),
      delay: schedule.delayMinutes || 0,
      status: schedule.isCancelled ? 'cancelled' : null
    });

    // Arrêts intermédiaires
    if (schedule.servedStations) {
      schedule.servedStations.forEach(station => {
        const stationName = typeof station === 'object' ? station.name : station;
        stops.push({
          station: stationName,
          arrivalTime: station.arrivalTime,
          departureTime: station.departureTime,
          type: 'intermediate',
          voie: getTrackForStation(schedule.id, stationName, station.departureTime),
          delay: schedule.delayMinutes || 0,
          status: schedule.isCancelled ? 'cancelled' : null
        });
      });
    }

    // Arrivée
    stops.push({
      station: schedule.arrivalStation,
      time: schedule.arrivalTime,
      type: 'arrival',
      voie: getTrackForStation(schedule.id, schedule.arrivalStation, schedule.arrivalTime),
      delay: schedule.delayMinutes || 0,
      status: schedule.isCancelled ? 'cancelled' : null
    });

    return stops;
  };

  return (
    <>
      <Header />

      <div className="mastheader">
        <div className="mastheader-logo d-none d-xl-block">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" height="40" />
          ) : (
            <i className="icons-logo"></i>
          )}
        </div>
        <header role="banner" className="mastheader-title">
          <h1 className="text-white mb-0">Vérification des trajets</h1>
        </header>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <nav role="navigation" className="pb-3">
              <div className="card mt-3">
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="row g-3 align-items-end">
                    <div className="col-md-8">
                      <label htmlFor="trainNumber" className="form-label">Numéro du train</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="icons-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="trainNumber"
                          placeholder="Ex: 891800"
                          value={trainNumber}
                          onChange={(e) => setTrainNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        ) : (
                          <i className="icons-search me-2"></i>
                        )}
                        Rechercher
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </nav>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="icons-warning me-2"></i>
                {error}
              </div>
            )}

            {schedule && (
              <div className="train-details">
                <div className="card mb-4">
                  <div className="card-header">
                    <div className="row align-items-center">
                      <div className="col">
                        <h2 className="h5 mb-0">
                          Train {schedule.trainNumber}
                          <span className="badge bg-primary ms-2">{schedule.trainType}</span>
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1">
                          <strong>Départ :</strong> {schedule.departureStation} à {formatTime(schedule.departureTime)}
                        </p>
                        <p className="mb-1">
                          <strong>Arrivée :</strong> {schedule.arrivalStation} à {formatTime(schedule.arrivalTime)}
                        </p>
                        <p className="mb-0">
                          <strong>Jours de circulation :</strong> {schedule.joursCirculation?.join(', ') || '-'}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <div className="train-visual-container">
                          <TrainVisualSlider
                            trainNumber={schedule.trainNumber}
                            composition={schedule.composition || []}
                            visualHeight={150}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="h5 mb-0">
                      <i className="icons-route me-2"></i>
                      Trajet et arrêts
                    </h3>
                  </div>
                  <div className="card-body p-0">
                    <div className="timeline">
                      {getStops().map((stop, index, array) => (
                        <div key={index} className={`timeline-item ${index === array.length - 1 ? 'last' : ''}`}>
                          <div className={`timeline-marker ${stop.delay ? 'delayed' : ''}`}>
                            {currentPosition?.type === 'at-station' && currentPosition.index === index && (
                              <div className="train-icon" dangerouslySetInnerHTML={{ __html: trainIcon }} />
                            )}
                          </div>
                          {currentPosition?.type === 'between-stations' && 
                           currentPosition.fromIndex === index && (
                            <div 
                              className="train-icon between-stations" 
                              dangerouslySetInnerHTML={{ __html: trainIcon }}
                              style={{
                                top: '50%',
                                left: '4rem',
                                transform: 'translate(-50%, 2rem)'
                              }}
                            />
                          )}
                          <div className="timeline-content">
                            <div className="row align-items-center">
                              <div className="col-md-3">
                                <div className="time-badge">
                                  {stop.type === 'departure' || stop.type === 'arrival' ? (
                                    <div className={stop.delay > 0 ? 'delayed-time' : ''}>
                                      {formatTime(stop.time)}
                                      {stop.delay > 0 && (
                                        <span className="updated-time">
                                          → {formatTime(getDelayedTime(stop.time, stop.delay))}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      <div className={stop.delay > 0 ? 'delayed-time' : ''}>
                                        {formatTime(stop.arrivalTime)}
                                        {stop.delay > 0 && (
                                          <span className="updated-time">
                                            → {formatTime(getDelayedTime(stop.arrivalTime, stop.delay))}
                                          </span>
                                        )}
                                      </div>
                                      <div className={stop.delay > 0 ? 'delayed-time' : ''}>
                                        {formatTime(stop.departureTime)}
                                        {stop.delay > 0 && (
                                          <span className="updated-time">
                                            → {formatTime(getDelayedTime(stop.departureTime, stop.delay))}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h4 className={`station-name ${stop.status === 'cancelled' ? 'cancelled' : ''}`}>
                                  {stop.station}
                                  {stop.status === 'cancelled' && (
                                    <span className="cancelled-badge">
                                      <i className="icons-close"></i>
                                      Arrêt supprimé
                                    </span>
                                  )}
                                </h4>
                                {stop.voie && (
                                  <div className="voie-info">
                                    <span className="voie-number">Voie {stop.voie}</span>
                                  </div>
                                )}
                              </div>
                              <div className="col-md-3">
                                {(stop.delay > 0 || stop.status) && (
                                  <div className={`delay-badge ${stop.status === 'cancelled' ? 'cancelled' : ''}`}>
                                    <i className={`icons-${stop.status === 'cancelled' ? 'close' : 'warning'} me-2`}></i>
                                    {stop.status === 'cancelled' ? (
                                      'Train supprimé'
                                    ) : (
                                      `Retard ${stop.delay} min`
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      <style jsx>{`
        .mastheader {
          background: var(--primary);
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .timeline {
          position: relative;
          padding: 0;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 4rem;
          top: 2rem;
          bottom: 2rem;
          width: 4px;
          background: var(--primary);
          opacity: 0.2;
        }

        .timeline-item {
          position: relative;
          padding: 1.5rem 1rem 1.5rem 5rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .timeline-item.last {
          border-bottom: none;
        }

        .timeline-marker {
          position: absolute;
          left: 4rem;
          top: 50%;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary);
          border: 3px solid #fff;
          transform: translate(-50%, -50%);
          z-index: 1;
          transition: all 0.3s ease;
        }

        .timeline-marker.delayed {
          background: var(--danger);
          transform: translate(-50%, -50%) scale(1.2);
        }

        .time-badge {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--primary);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .delayed-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .updated-time {
          color: var(--warning);
          font-weight: 700;
        }

        .station-name {
          font-size: 1.1rem;
          margin: 0;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .station-name.cancelled {
          text-decoration: line-through;
          color: var(--danger);
        }

        .voie-info {
          display: inline-flex;
          align-items: center;
          margin-top: 0.5rem;
          background: #E9ECEF;
          padding: 4px 8px;
          border-radius: 16px;
          border: 1px solid #DEE2E6;
        }

        .voie-number {
          font-weight: 500;
          font-size: 0.875rem;
          color: #495057;
        }

        .train-visual-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 150px;
          position: relative;
          z-index: 1;
        }

        .card-body {
          position: relative;
          overflow: visible;
        }

        .delay-badge {
          display: inline-flex;
          align-items: center;
          background: var(--warning);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .delay-badge.cancelled {
          background: var(--danger);
        }

        .train-icon {
          position: absolute;
          width: 24px;
          height: 24px;
          color: #000;
          background-color: #bbff00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .train-icon.between-stations {
          position: absolute;
          transform: translate(-50%, -50%);
        }

        .train-icon svg {
          width: 20px;
          height: 20px;
          fill: #000;
          color: #000;
        }

        @media (max-width: 768px) {
          .timeline::before {
            left: 2rem;
          }

          .timeline-item {
            padding-left: 3rem;
          }

          .timeline-marker {
            left: 2rem;
          }

          .time-badge {
            font-size: 1rem;
          }

          .station-name {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
