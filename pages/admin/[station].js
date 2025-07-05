import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import StationSearchForm from '../../components/StationSearchForm';
import { calculateDuration } from '../../utils/dateUtils';
import {
  getStationSchedules,
  filterSchedulesByType,
  getStationTime,
  getStationEndpoint,
  formatOperatingDays,
  sortSchedulesByTime,
  getTrainStatus,
  getDelayedTime
} from '../../utils/scheduleUtils';

export default function StationSchedule() {
  const router = useRouter();
  const { station } = router.query;
  const [scheduleType, setScheduleType] = useState('departures');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    if (station) {
      const decodedStation = decodeURIComponent(station);
      const stationSchedules = getStationSchedules(decodedStation);
      const filtered = filterSchedulesByType(stationSchedules, decodedStation, scheduleType);
      const sorted = sortSchedulesByTime(filtered, decodedStation, scheduleType);
      setSchedules(sorted);
      setLoading(false);
    }
  }, [station, scheduleType]);

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const getAllStations = (schedule) => {
    const stations = [];
    const status = getTrainStatus(schedule);
    
    stations.push({
      name: schedule.departureStation,
      originalTime: schedule.departureTime,
      time: status.status === 'delayed' ? getDelayedTime(schedule.departureTime, schedule.delayMinutes) : schedule.departureTime,
      track: '-',
      status
    });

    if (schedule.servedStations) {
      schedule.servedStations.forEach(station => {
        const stationTime = typeof station === 'object' ? station.departureTime : null;
        stations.push({
          name: typeof station === 'object' ? station.name : station,
          originalTime: stationTime,
          time: status.status === 'delayed' && stationTime ? getDelayedTime(stationTime, schedule.delayMinutes) : stationTime,
          track: '1',
          status
        });
      });
    }

    stations.push({
      name: schedule.arrivalStation,
      originalTime: schedule.arrivalTime,
      time: status.status === 'delayed' ? getDelayedTime(schedule.arrivalTime, schedule.delayMinutes) : schedule.arrivalTime,
      track: '-',
      status
    });

    return stations;
  };

  if (!station) return null;

  return (
    <Layout>
      <div className="schedule-page">
        <div className="container-fluid py-4">
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
                <div className="schedule-list">
                  {loading ? (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Chargement...</span>
                      </div>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-4">
                      Aucun horaire trouvé pour cette gare
                    </div>
                  ) : (
                    <div className="schedule-table">
                      {schedules.map((schedule) => {
                        const status = getTrainStatus(schedule);
                        return (
<div key={schedule.id} className={`schedule-item ${status.className}`}>
  <div
    className="schedule-row"
    onClick={() => handleScheduleClick(schedule)}
    style={status.status === 'cancelled' ? { textDecoration: 'line-through', color: '#dc3545' } : {}}
  >
    <div className="schedule-time">
      {status.status === 'delayed' ? (
        <>
          <span className="original-time">
            {getStationTime(schedule, decodeURIComponent(station), scheduleType === 'departures' ? 'departure' : 'arrival')}
          </span>
          <span className="delayed-time">
            {status.delayedTime}
          </span>
        </>
      ) : (
        getStationTime(schedule, decodeURIComponent(station), scheduleType === 'departures' ? 'departure' : 'arrival')
      )}
    </div>
    <div className="schedule-destination">
      {getStationEndpoint(schedule, decodeURIComponent(station), scheduleType)}
    </div>
    <div className="schedule-train">
      <i className="icons-train mr-2" aria-hidden="true"></i>
      Train {schedule.trainNumber}
    </div>
    <div className="schedule-track">
      Quai: {schedule.track || '-'}
    </div>
    <div className="schedule-arrival">
      {scheduleType === 'departures' ? schedule.arrivalTime : schedule.departureTime}
    </div>
    <div className="schedule-status">
      {status.status === 'ontime' && (
        <i className="icons-check text-success" aria-hidden="true"></i>
      )}
      {status.status === 'delayed' && (
        <span className="badge bg-warning">
          {status.label}
        </span>
      )}
    </div>
  </div>
  {status.status === 'cancelled' && (
    <div className="cancellation-banner">
      Train supprimé
    </div>
  )}
</div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedSchedule && (
          <div className="modal-overlay">
            <div className="stations-modal">
              <div className="stations-modal-header">
                <div>
                  <h3>Liste des gares</h3>
                  <p>desservies par le train {selectedSchedule.trainType} {selectedSchedule.trainNumber}</p>
                  <p>Opéré par SNCF Voyageurs - {selectedSchedule.trainNumber}</p>
                </div>
                <button className="close-button" onClick={() => setSelectedSchedule(null)}>×</button>
              </div>
              <div className="stations-modal-content">
                <div className="stations-grid">
                  <div className="stations-header">
                    <div>Départ</div>
                    <div>Gare</div>
                    <div>Voie</div>
                  </div>
                  {getAllStations(selectedSchedule).map((station, index) => (
                    <div key={index} className={`station-row ${station.status.className}`}>
                      <div className="station-time">
                        {station.status.status === 'delayed' ? (
                          <div className="delayed-times">
                            <span className="delayed-new-time">{station.time}</span>
                            <span className="delayed-original-time">{station.originalTime}</span>
                          </div>
                        ) : (
                          station.time || '-'
                        )}
                      </div>
                      <div className="station-name">
                        <span className="station-dot"></span>
                        {station.name}
                      </div>
                      <div className="station-track">{station.track}</div>
                    </div>
                  ))}
                </div>
                {selectedSchedule.isCancelled && (
                  <div className="cancellation-banner mt-3">
                    Train supprimé
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .schedule-page {
            background-color: #f8f9fa;
            min-height: calc(100vh - 64px);
          }

          .schedule-table {
            padding: 0;
          }

          .schedule-item {
            margin-bottom: 1px;
          }

          .schedule-item.status-cancelled .schedule-row {
            position: relative;
            color: #dc3545;
            opacity: 0.8;
          }

          .schedule-item.status-cancelled .schedule-row::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background-color: #dc3545;
          }

          .schedule-row {
            display: grid;
            grid-template-columns: 80px 1fr 200px 80px 100px;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            cursor: pointer;
            background: white;
            transition: background-color 0.2s;
          }

          .schedule-row:hover {
            background-color: #f8f9fa;
          }

          .schedule-time {
            font-size: 1.1rem;
            font-weight: 600;
            color: #000066;
          }

          .original-time {
            text-decoration: line-through;
            color: #666;
            margin-right: 0.5rem;
            font-size: 0.9rem;
          }

          .delayed-time {
            color: #fd7e14;
          }

          .schedule-destination {
            font-weight: 500;
          }

          .schedule-train {
            color: #666;
            font-size: 0.9rem;
          }

          .schedule-arrival {
            font-size: 0.9rem;
            color: #666;
            text-align: center;
          }

          .schedule-status {
            text-align: right;
          }

          .cancellation-banner {
            background-color: #dc3545;
            color: white;
            text-align: center;
            padding: 0.5rem;
            font-weight: 500;
            font-size: 0.9rem;
          }

          .badge {
            font-size: 0.8rem;
            padding: 0.4em 0.6em;
          }

          .badge.bg-warning {
            background-color: #fd7e14 !important;
            color: white;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .stations-modal {
            background-color: #e8f5e9;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .stations-modal-header {
            background: white;
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .stations-modal-header h3 {
            font-size: 1.25rem;
            margin: 0;
            color: #000066;
          }

          .stations-modal-header p {
            margin: 0;
            font-size: 0.875rem;
            color: #666;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 2rem;
            line-height: 1;
            padding: 0;
            cursor: pointer;
            color: #666;
          }

          .stations-modal-content {
            padding: 2rem;
            background: white;
            margin: 1rem;
            border-radius: 8px;
          }

          .stations-grid {
            position: relative;
          }

          .stations-header {
            display: grid;
            grid-template-columns: 100px 1fr 80px;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .station-row {
            display: grid;
            grid-template-columns: 100px 1fr 80px;
            align-items: center;
            padding: 0.5rem 0;
          }

          .station-row.status-cancelled {
            position: relative;
            color: #dc3545;
            opacity: 0.8;
          }

          .station-row.status-cancelled::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background-color: #dc3545;
          }

          .station-time {
            font-weight: 600;
            min-height: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .delayed-times {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .delayed-new-time {
            color: #fd7e14;
            font-weight: 600;
            font-size: 1rem;
          }

          .delayed-original-time {
            text-decoration: line-through;
            color: #666;
            font-size: 8px;
            margin-top: 2px;
          }

          .station-name {
            display: flex;
            align-items: center;
            position: relative;
          }

          .station-dot {
            width: 12px;
            height: 12px;
            background-color: #ffd700;
            border-radius: 50%;
            margin-right: 1rem;
            position: relative;
            z-index: 2;
          }

          .station-track {
            text-align: center;
          }

          .stations-grid::before {
            content: '';
            position: absolute;
            top: 2.5rem;
            bottom: 0.5rem;
            left: 105px;
            width: 2px;
            background-color: #ffd700;
            z-index: 1;
          }

          @media (max-width: 768px) {
            .schedule-row {
              grid-template-columns: 80px 1fr auto;
              gap: 1rem;
            }

            .schedule-train {
              display: none;
            }

            .schedule-arrival {
              display: none;
            }

            .stations-modal {
              width: 95%;
              margin: 1rem;
            }

            .stations-grid {
              font-size: 0.9rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
