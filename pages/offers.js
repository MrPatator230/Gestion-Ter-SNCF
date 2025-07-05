import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { AuthContext } from '../src/contexts/AuthContext';
import { useTrackAssignments } from '../src/contexts/TrackAssignmentContext';
import TrainVisualSlider from '../components/TrainVisualSlider';
import modalStyles from './modal.module.css';
import { 
  formatDisplayDate, 
  formatDay,
  calculateDuration
} from '../utils/dateUtils';
import { getDelayedTime } from '../utils/scheduleUtils';

// Helper function to format time string "HH:mm" to "HHhmm"
const formatTimeHHhmm = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}h${minutes}`;
};

// Mapping des jours en français vers l'anglais (utilisé uniquement pour le filtrage)
const DAYS_MAPPING = {
  'lundi': 'Monday',
  'mardi': 'Tuesday',
  'mercredi': 'Wednesday',
  'jeudi': 'Thursday',
  'vendredi': 'Friday',
  'samedi': 'Saturday',
  'dimanche': 'Sunday'
};

export default function Offers() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showStationsModal, setShowStationsModal] = useState(false);
  const { trackAssignments } = useTrackAssignments();

  useEffect(() => {
    if (router.query.departureStation) {
      const { departureStation, arrivalStation, viaStation, departureDate, returnDate } = router.query;

      const fetchSchedules = async () => {
        try {
          // Call API with only station=departureStation
          const params = new URLSearchParams({
            station: departureStation
          });

          const response = await fetch(`/api/schedules/by-station?${params.toString()}`);
          if (!response.ok) {
            throw new Error('Failed to fetch schedules');
          }
          const allSchedules = await response.json();
          console.log('Fetched schedules:', allSchedules);

          // Filter schedules client-side for departureStation, arrivalStation, viaStation, and joursCirculation
          let departureSchedules = allSchedules.filter(schedule => {
            // Check if schedule matches departureStation and arrivalStation or viaStation in servedStations
            const matchesDeparture = schedule.departureStation === departureStation || 
              (schedule.servedStations && schedule.servedStations.some(s => (typeof s === 'object' ? s.name : s) === departureStation));
            const matchesArrival = schedule.arrivalStation === arrivalStation || 
              (schedule.servedStations && schedule.servedStations.some(s => (typeof s === 'object' ? s.name : s) === arrivalStation));
            const matchesVia = !viaStation || (schedule.servedStations && schedule.servedStations.some(s => (typeof s === 'object' ? s.name : s) === viaStation));

            // Check if train runs on the selected day
            const dayOfWeek = formatDay(new Date(departureDate)).toLowerCase();
            const englishDayOfWeek = DAYS_MAPPING[dayOfWeek];
            const runsOnThisDay = schedule.joursCirculation?.includes(englishDayOfWeek);

            return matchesDeparture && matchesArrival && matchesVia && runsOnThisDay;
          }).map(schedule => {
            // Adapt schedule times for display
            const adaptedSchedule = { ...schedule };

            if (departureStation !== schedule.departureStation) {
              const servedStation = schedule.servedStations.find(s => (typeof s === 'object' ? s.name : s) === departureStation);
              if (servedStation) {
                adaptedSchedule.displayDepartureTime = servedStation.departureTime;
                adaptedSchedule.displayDepartureStation = departureStation;
              }
            } else {
              adaptedSchedule.displayDepartureTime = schedule.departureTime;
              adaptedSchedule.displayDepartureStation = schedule.departureStation;
            }

            if (arrivalStation !== schedule.arrivalStation) {
              const servedStation = schedule.servedStations.find(s => (typeof s === 'object' ? s.name : s) === arrivalStation);
              if (servedStation) {
                adaptedSchedule.displayArrivalTime = servedStation.arrivalTime;
                adaptedSchedule.displayArrivalStation = arrivalStation;
              }
            } else {
              adaptedSchedule.displayArrivalTime = schedule.arrivalTime;
              adaptedSchedule.displayArrivalStation = schedule.arrivalStation;
            }

            return adaptedSchedule;
          });

          // Filter return schedules similarly if returnDate is provided
          let returnSchedules = null;
          if (returnDate) {
            returnSchedules = allSchedules.filter(schedule => {
              const matchesDeparture = schedule.departureStation === arrivalStation || 
                (schedule.servedStations && schedule.servedStations.some(s => (typeof s === 'object' ? s.name : s) === arrivalStation));
              const matchesArrival = schedule.arrivalStation === departureStation || 
                (schedule.servedStations && schedule.servedStations.some(s => (typeof s === 'object' ? s.name : s) === departureStation));
              const matchesVia = !viaStation || (schedule.servedStations && schedule.servedStations.some(s => (typeof s === 'object' ? s.name : s) === viaStation));

              const dayOfWeek = formatDay(new Date(returnDate)).toLowerCase();
              const englishDayOfWeek = DAYS_MAPPING[dayOfWeek];
              const runsOnThisDay = schedule.joursCirculation?.includes(englishDayOfWeek);

              return matchesDeparture && matchesArrival && matchesVia && runsOnThisDay;
            }).map(schedule => {
              const adaptedSchedule = { ...schedule };

              if (arrivalStation !== schedule.departureStation) {
                const servedStation = schedule.servedStations.find(s => (typeof s === 'object' ? s.name : s) === arrivalStation);
                if (servedStation) {
                  adaptedSchedule.displayDepartureTime = servedStation.departureTime;
                  adaptedSchedule.displayDepartureStation = arrivalStation;
                }
              } else {
                adaptedSchedule.displayDepartureTime = schedule.departureTime;
                adaptedSchedule.displayDepartureStation = schedule.departureStation;
              }

              if (departureStation !== schedule.arrivalStation) {
                const servedStation = schedule.servedStations.find(s => (typeof s === 'object' ? s.name : s) === departureStation);
                if (servedStation) {
                  adaptedSchedule.displayArrivalTime = servedStation.arrivalTime;
                  adaptedSchedule.displayArrivalStation = departureStation;
                }
              } else {
                adaptedSchedule.displayArrivalTime = schedule.arrivalTime;
                adaptedSchedule.displayArrivalStation = schedule.arrivalStation;
              }

              return adaptedSchedule;
            });
          }

          setSearchResults({
            aller: {
              date: departureDate,
              trains: departureSchedules.sort((a, b) =>
                a.displayDepartureTime.localeCompare(b.displayDepartureTime)
              )
            },
            retour: returnDate ? {
              date: returnDate,
              trains: returnSchedules.sort((a, b) =>
                a.displayDepartureTime.localeCompare(b.displayDepartureTime)
              )
            } : null
          });
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching schedules:', error);
          setIsLoading(false);
        }
      };

      fetchSchedules();
    }
  }, [router.query]);

  const [ticketTypes, setTicketTypes] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const savedTicketTypes = localStorage.getItem('ticketTypes');
    if (savedTicketTypes) {
      setTicketTypes(JSON.parse(savedTicketTypes));
    }
  }, []);

  const handleScheduleClick = (schedule) => {
    console.log('Schedule clicked:', schedule);
    console.log('Current modal state:', showStationsModal);
    setSelectedSchedule(schedule);
    setShowStationsModal(true);
    console.log('New modal state:', true);
  };

  const handlePurchaseTicket = (schedule) => {
    console.log('handlePurchaseTicket called');
    console.log('User:', user);
    if (!user) {
      alert('Vous devez être connecté pour acheter un billet.');
      router.push('/login');
      return;
    }

    // Check if user role is client (case insensitive)
    if (!user.role || user.role.toLowerCase() !== 'client') {
      alert('Seuls les utilisateurs avec le rôle Client peuvent réserver un billet.');
      return;
    }

    // Get the ticket type for single journey
    const ticketType = ticketTypes.find(t => t.category === 'Billet');
    console.log('Ticket types:', ticketTypes);
    console.log('Selected ticket type:', ticketType);
    if (!ticketType) {
      alert('Aucun type de billet disponible.');
      return;
    }

    // Add ticket to cart instead of immediate reservation
    const cartKey = `ticketCart_${user.username || user.id}`;
    console.log('Cart key:', cartKey);
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    console.log('Current cart:', cart);
    const ticket = {
      id: Date.now().toString(),
      typeId: ticketType.id,
      typeName: ticketType.name,
      price: ticketType.price,
      category: ticketType.category,
      date: new Date().toISOString(),
      schedule: {
        trainNumber: schedule.trainNumber,
        trainType: schedule.trainType,
        departureStation: schedule.displayDepartureStation,
        arrivalStation: schedule.displayArrivalStation,
        departureTime: schedule.displayDepartureTime,
        arrivalTime: schedule.displayArrivalTime,
      }
    };
    cart.push(ticket);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    console.log('Updated cart:', cart);
    alert('Billet ajouté au panier !');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="offers-page">
        <div className="container py-4">
          <div className="journey-header mb-4">
            <div className="d-flex align-items-center mb-3">
              <span className="material-icons text-primary me-2">train</span>
              <h2 className="mb-0">
                {router.query.departureStation} 
                {router.query.viaStation && (
                  <span className="via-text">
                    <span className="material-icons">arrow_forward</span>
                    {router.query.viaStation}
                  </span>
                )}
                <span className="material-icons">arrow_forward</span>
                {router.query.arrivalStation}
              </h2>
            </div>
            <button 
              onClick={() => router.back()} 
              className="btn btn-link text-primary p-0"
            >
              <span className="material-icons align-middle me-1">arrow_back</span>
              Modifier ma recherche
            </button>
          </div>

          {searchResults && (
            <>
              {/* Résultats Aller */}
              <div className="offers-section mb-4">
                <div className="offers-header">
                  <h3 className="h5 mb-3">
                    Trains disponibles le {formatDisplayDate(searchResults.aller.date)}
                  </h3>
                </div>
                
                {searchResults.aller.trains.length > 0 ? (
                  <div className="offers-list">
                    {searchResults.aller.trains.map((train) => (
                      <div key={train.id} className="offer-card" onClick={() => handleScheduleClick(train)} style={{ cursor: 'pointer' }}>
                        <div 
                          className="offer-header"
                        >
                          <div className="train-info" style={train.isCancelled ? { textDecoration: 'line-through', color: 'red' } : {}}>
                            <span className="train-type">{train.trainType}</span>
                            <span className="train-number">N° {train.trainNumber}</span>
                        </div>
                          <div className="train-status">
                            {train.isCancelled ? (
                              <span className="badge bg-danger">Supprimé</span>
                            ) : train.delayMinutes ? (
                              <span className="badge bg-warning text-dark">
                                Retard {train.delayMinutes} min
                              </span>
                            ) : (
                              <span className="badge bg-success">À l'heure</span>
                            )}
                          </div>
                       </div>
                       
                       <div className="offer-body" style={train.isCancelled ? { textDecoration: 'line-through', color: 'red' } : {}}>
                         <div className="journey-times">
                           <div className="departure">
                           <div className="time">
                             {train.isCancelled ? (
                               formatTimeHHhmm(train.displayDepartureTime)
                             ) : train.delayMinutes ? (
                               <>
                                 <div className="delayed-time">
                                   {getDelayedTime(train.displayDepartureTime, train.delayMinutes)}
                                 </div>
                                 <div className="original-time">
                                   {formatTimeHHhmm(train.displayDepartureTime)}
                                 </div>
                               </>
                             ) : (
                               formatTimeHHhmm(train.displayDepartureTime)
                             )}
                           </div>
                           <div className="station">{train.displayDepartureStation}</div>
                         </div>
                         <div className="journey-duration">
                           <div className="duration-line"></div>
                           <div className="duration-time">
                             {calculateDuration(train.displayDepartureTime, train.displayArrivalTime)}
                           </div>
                         </div>
                         <div className="arrival">
                           <div className="time">
                             {train.isCancelled ? (
                               formatTimeHHhmm(train.displayArrivalTime)
                             ) : train.delayMinutes ? (
                               <>
                                 <div className="delayed-time">
                                   {getDelayedTime(train.displayArrivalTime, train.delayMinutes)}
                                 </div>
                                 <div className="original-time">
                                   {formatTimeHHhmm(train.displayArrivalTime)}
                                 </div>
                               </>
                             ) : (
                               formatTimeHHhmm(train.displayArrivalTime)
                             )}
                           </div>
                           <div className="station">{train.displayArrivalStation}</div>
                         </div>
                         </div>
                         {train.servedStations && train.servedStations.length > 0 && (
                           <div className="via-stations">
                             <span className="material-icons">route</span>
                             Gares desservies : {train.servedStations.map(s => s.name).join(', ')}
                           </div>
                         )}
                         <div className="quai-display mt-2">
                           Quai: {trackAssignments[train.id]?.[train.displayDepartureStation] || '-'}
                         </div>
                       </div>
                       <div className="offer-actions">
                         <button 
                           className={`btn ${train.isCancelled ? 'btn-secondary disabled' : 'btn-primary'}`}
                           disabled={train.isCancelled}
                           onClick={(e) => {
                             e.stopPropagation();
                             handlePurchaseTicket(train);
                           }}
                         >
                           Acheter un billet
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
                 ) : (
                   <div className="alert alert-info">
                     Aucun train ne circule ce jour.
                   </div>
                 )}
               </div>

              {/* Résultats Retour */}
              {searchResults.retour && (
                <div className="offers-section">
                  <div className="offers-header">
                    <h3 className="h5 mb-3">
                      Trains disponibles le {formatDisplayDate(searchResults.retour.date)}
                    </h3>
                  </div>
                  
                  {searchResults.retour.trains.length > 0 ? (
                    <div className="offers-list">
                      {searchResults.retour.trains.map((train) => (
                        <div key={train.id} className="offer-card">
                          <div 
                            className="offer-header"
                            onClick={() => handleScheduleClick(train)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="train-info">
                              <span className="train-type">{train.trainType}</span>
                              <span className="train-number">N° {train.trainNumber}</span>
                            </div>
                            <div className="train-status">
                              <span className="badge bg-success">À l'heure</span>
                            </div>
                          </div>
                          
                          <div className="offer-body">
                            <div className="journey-times">
                              <div className="departure">
                                <div className="time">{train.displayDepartureTime}</div>
                                <div className="station">{train.displayDepartureStation}</div>
                              </div>
                              <div className="journey-duration">
                                <div className="duration-line"></div>
                                <div className="duration-time">
                                  {calculateDuration(train.displayDepartureTime, train.displayArrivalTime)}
                                </div>
                              </div>
                              <div className="arrival">
                                <div className="time">{train.displayArrivalTime}</div>
                                <div className="station">{train.displayArrivalStation}</div>
                              </div>
                            </div>
                            {train.servedStations && train.servedStations.length > 0 && (
                              <div className="via-stations">
                                <span className="material-icons">route</span>
                                Gares desservies : {train.servedStations.map(s => s.name).join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="offer-actions">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePurchaseTicket(train);
                              }}
                            >
                              Acheter un billet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      Aucun train ne circule ce jour.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Modal des gares desservies */}
          {showStationsModal && selectedSchedule && (
            <div className={modalStyles.modalOverlay} onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowStationsModal(false);
              }
            }}>
              <div className={modalStyles.stationsModal}>
                <div className={modalStyles.stationsModalHeader}>
                  <div>
                    <h3>Liste des gares</h3>
                    <p>desservies par le train {selectedSchedule.trainType} {selectedSchedule.trainNumber}</p>
                    <p>Opéré par SNCF Voyageurs - {selectedSchedule.trainNumber}</p>
                  </div>
                  <button className={modalStyles.closeButton} onClick={() => setShowStationsModal(false)}>×</button>
                </div>
                <div className={modalStyles.stationsModalContent}>
                  {selectedSchedule.composition && selectedSchedule.composition.length > 0 && (
                    <div className="mb-4">
                      <TrainVisualSlider
                        trainNumber={selectedSchedule.trainNumber}
                        composition={selectedSchedule.composition}
                      />
                    </div>
                  )}
                  <div className={modalStyles.stationsGrid}>
                    <div className={modalStyles.stationsHeader}>
                      <div>Départ</div>
                      <div>Gare</div>
                      <div>Voie</div>
                    </div>
                    {/* Gare de départ */}
                    <div className={modalStyles.stationRow}>
                      <div className={modalStyles.stationTime}>{selectedSchedule.departureTime}</div>
                      <div className={modalStyles.stationName}>
                        <span className={modalStyles.stationDot}></span>
                        {selectedSchedule.departureStation}
                      </div>
                      <div className={modalStyles.stationTrack}>
                        {trackAssignments[selectedSchedule.id]?.[selectedSchedule.departureStation] || '-'}
                      </div>
                    </div>

                    {/* Gares desservies */}
                    {selectedSchedule.servedStations && selectedSchedule.servedStations.map((station, index) => {
                      const stationName = typeof station === 'object' ? station.name : station;
                      const stationTime = typeof station === 'object' ? station.departureTime : null;
                      const quai = trackAssignments[selectedSchedule.id]?.[stationName] || '-';
                      return (
                        <div key={index} className={modalStyles.stationRow}>
                          <div className={modalStyles.stationTime}>{stationTime || '-'}</div>
                          <div className={modalStyles.stationName}>
                            <span className={modalStyles.stationDot}></span>
                            {stationName}
                          </div>
                          <div className={modalStyles.stationTrack}>{quai}</div>
                        </div>
                      );
                    })}

                    {/* Gare d'arrivée */}
                    <div className={modalStyles.stationRow}>
                      <div className={modalStyles.stationTime}>{selectedSchedule.arrivalTime}</div>
                      <div className={modalStyles.stationName}>
                        <span className={modalStyles.stationDot}></span>
                        {selectedSchedule.arrivalStation}
                      </div>
                      <div className={modalStyles.stationTrack}>
                        {trackAssignments[selectedSchedule.id]?.[selectedSchedule.arrivalStation] || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .offers-page {
            background-color: #f8f9fa;
            min-height: calc(100vh - 64px);
          }

          .journey-header h2 {
            color: #000066;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .via-text {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #666;
          }

          .offers-section {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .offers-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .offer-card {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s;
          }

          .offer-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .offer-header {
            background: #f8f9fa;
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .train-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .train-type {
            font-weight: 600;
            color: #000066;
          }

          .train-number {
            color: #666;
          }

          .offer-body {
            padding: 1.5rem;
          }

          .journey-times {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 2rem;
            align-items: center;
            margin-bottom: 1rem;
          }

          .departure, .arrival {
            text-align: center;
          }

          .time {
            font-weight: 600;
            color: #000066;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .delayed-time {
            color: #fd7e14;
            font-weight: 600;
            font-size: 1rem;
          }

          .original-time {
            text-decoration: line-through;
            color: #666;
            font-size: 0.7rem;
            margin-top: 2px;
          }

          .badge.bg-warning {
            background-color: #fd7e14 !important;
            color: white !important;
          }

          .station {
            color: #666;
            font-size: 0.875rem;
          }

          .journey-duration {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .duration-line {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: #dee2e6;
            z-index: 1;
          }

          .duration-time {
            background: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
            color: #666;
            position: relative;
            z-index: 2;
          }

          .via-stations {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #666;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #dee2e6;
          }

          .via-stations .material-icons {
            font-size: 1rem;
            color: #0F8548;
          }

          .stations-list {
            position: relative;
            padding: 1rem;
          }

          .station-row {
            display: grid;
            grid-template-columns: 100px 1fr 80px;
            align-items: center;
            padding: 0.5rem 0;
            position: relative;
          }

          .station-row.header {
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .station {
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
          }

          .station-dot {
            width: 12px;
            height: 12px;
            background-color: #ffd700;
            border-radius: 50%;
            position: relative;
            z-index: 2;
          }

          .stations-list::before {
            content: '';
            position: absolute;
            top: 4rem;
            bottom: 2rem;
            left: calc(100px + 1rem + 6px);
            width: 2px;
            background-color: #ffd700;
            z-index: 1;
          }

          .time {
            font-weight: 600;
            color: #000066;
          }

          .track {
            text-align: center;
          }

          .modal-content {
            border-radius: 12px;
            overflow: hidden;
          }

          .modal-header {
            background-color: white;
            border-bottom: none;
          }

          .offer-actions {
            padding: 1rem;
            border-top: 1px solid #dee2e6;
            display: flex;
            justify-content: flex-end;
          }

          .modal-body {
            padding: 2rem;
          }

          @media (max-width: 768px) {
            .journey-times {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .journey-duration {
              display: none;
            }

            .journey-header h2 {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
