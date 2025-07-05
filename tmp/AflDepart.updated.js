import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from './AflDepart.module.css';
import { filterSchedulesByType, sortSchedulesByTime, getTrainStatus, getStationTime } from '../../../utils/scheduleUtils';
import { useTrackAssignments } from '../../../src/contexts/TrackAssignmentContext';
import { SettingsContext } from '../../../contexts/SettingsContext';

// Helper function to get current day string in English (e.g., 'Monday')
const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  return days[now.getDay()];
};

// Helper function to format time string "HH:mm" to 'HH:mm'
const formatTimeHHmm = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};

export default function AFLDepartures() {
  const router = useRouter();
  const { gare } = router.query;

  const { servedStationsLines } = useContext(SettingsContext);
  const trackAssignmentsContext = useTrackAssignments();
  const trackAssignments = trackAssignmentsContext ? trackAssignmentsContext.trackAssignments : {};

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [stationInfo, setStationInfo] = useState(null);
  const [showStatus, setShowStatus] = useState(true);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    async function fetchStationInfo() {
      if (gare) {
        try {
          const res = await fetch('/api/stations');
          if (!res.ok) {
            throw new Error(`Failed to fetch stations: ${res.status}`);
          }
          const stations = await res.json();
          const currentStation = stations.find(st => st.name === gare);
          setStationInfo(currentStation || null);
        } catch (error) {
          console.error('Failed to fetch station info:', error);
          setStationInfo(null);
        }
      }
    }

    async function fetchSchedules() {
      if (gare) {
        try {
          const res = await fetch('/api/schedules/by-station?station=' + gare);
          if (!res.ok) {
            throw new Error(`API request failed: ${res.status}`);
          }
          let allSchedules = await res.json();

          const schedulesWithParsedData = allSchedules.map(s => {
            try {
              return {
                ...s,
                joursCirculation: s.joursCirculation && typeof s.joursCirculation === 'string' ? JSON.parse(s.joursCirculation) : s.joursCirculation || [],
              };
            } catch (e) {
              console.warn(`Failed to parse data for schedule ${s.id}`, e);
              return { ...s, joursCirculation: [] };
            }
          });

          // Filter schedules where gare is either departure station or served station
          const filteredByType = filterSchedulesByType(schedulesWithParsedData, gare, 'departures').filter(schedule => {
            const normalizedStations = schedule.servedStations ? schedule.servedStations.map(station => (typeof station === 'object' ? station.name : station)) : [];
            return schedule.departureStation === gare || normalizedStations.includes(gare);
          });

          const currentDay = getCurrentDay();
          const filteredByDay = filteredByType.filter(schedule => {
            if (!schedule.joursCirculation || schedule.joursCirculation.length === 0) {
              return true;
            }
            return schedule.joursCirculation.includes(currentDay);
          });

          const sorted = sortSchedulesByTime(filteredByDay, gare, 'departures');
          setSchedules(sorted);
        } catch (error) {
          console.error('Failed to fetch schedules:', error);
          setSchedules([]);
        }
        setLoading(false);
      } else {
        setSchedules([]);
        setLoading(false);
      }
    }

    async function fetchData() {
      await fetchStationInfo();
      await fetchSchedules();
    }

    fetchData();

    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [gare]);

  useEffect(() => {
    if (schedules.length < 5) {
      setCurrentPage(0);
      return;
    }
    const pageInterval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % 2);
    }, 10000);
    return () => clearInterval(pageInterval);
  }, [schedules]);

  useEffect(() => {
    if (schedules.length < 5) {
      setShowStatus(true);
      return;
    }
    const toggleInterval = setInterval(() => {
      setShowStatus(prev => !prev);
    }, 2000);
    return () => clearInterval(toggleInterval);
  }, [schedules]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const scrollStep = 1; // pixels per interval
    const scrollInterval = 50; // ms

    const intervalId = setInterval(() => {
      if (scrollAmount >= maxScrollLeft) {
        scrollAmount = 0;
        scrollContainer.scrollLeft = 0;
      } else {
        scrollAmount += scrollStep;
        scrollContainer.scrollLeft = scrollAmount;
      }
    }, scrollInterval);

    return () => clearInterval(intervalId);
  }, [schedules]);

  if (!gare) {
    return (
      <main className={styles.aflContainer} role="main">
        <p className={styles.errorMessage}>Paramètre gare manquant. Veuillez fournir la gare dans l'URL.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.aflContainer} role="main" aria-label="Tableau des départs">
        <p className={styles.loadingMessage}>Chargement...</p>
      </main>
    );
  }

  if (schedules.length === 0) {
    return (
      <main className={styles.aflContainer} role="main" aria-label="Tableau des départs">
        <p className={styles.noSchedulesMessage}>Aucun horaire trouvé pour cette gare.</p>
      </main>
    );
  }

const now = new Date();

const filteredSchedules = schedules.filter(schedule => {
  const timeStr = getStationTime(schedule, gare, 'departure');
  if (!timeStr) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const scheduleDate = new Date();
  scheduleDate.setHours(hours, minutes, 0, 0);
  const diffMs = now - scheduleDate;
  return diffMs <= 60000; // 1 minute in milliseconds
});

const schedulesToDisplay = currentPage === 0 ? filteredSchedules.slice(0, 4) : filteredSchedules.slice(4, 14);

  return (
    <div lang="fr">
      <header className={styles.header}>
<svg viewBox="0 0 368 500" className={styles.headerIcon} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" style={{ height: '3rem' }}>
          <path d="M25.2 495.2L49.6 468h269l24.4 27.2c5.7 6.4 15.1 6.4 20.8 0 5.7-6.4 5.7-16.8 0-23.1l-70.7-78.7c1.6-1.1 3.2-2.3 4.3-3.4 13.1-10.6 25.3-26.9 34.2-52.1 12.4-35.4 21.2-67 23.7-105.9 3.3-48-16.4-122.5-29.4-157.2l-4.6-12.3c-2.8-7.8-13.5-24.4-32.5-44.2C272.3 1.2 256.6 0 232.7 0h-97.2c-23.9 0-39.6 1.2-56 18.3-19 19.8-29.7 36.4-32.6 44.2l-4.6 12.3C29.3 109.5 9.6 184 12.9 232c2.4 38.8 11.2 70.3 23.7 105.8 8.9 25.3 21.1 41.6 34.2 52.1 1.2 1.1 2.7 2.2 4.4 3.3L4.4 472c-5.8 6.4-5.8 16.8 0 23.1 5.8 6.5 15.1 6.5 20.8.1zM79 435.3l26.1-29c12.7 2.9 24.4 2.9 32.9 2.9h92.1c8.5 0 20.2 0 32.9-2.9l26.1 29H79zm190.3-70.7c-13.4 0-24.3-10.9-24.3-24.3s10.9-24.3 24.3-24.3 24.3 10.9 24.3 24.3-10.9 24.3-24.3 24.3zm-220-155.9c-14.9 0 8.5-130.5 19.1-130.5h228.7c11.6 0 38.7 130.5 20.5 130.5H49.3zm24.8 131.6c0-13.4 10.9-24.3 24.3-24.3s24.3 10.9 24.3 24.3-10.9 24.3-24.3 24.3-24.3-10.9-24.3-24.3z" fill="#ffffff"/>
        </svg>
        <h1 className={styles.headerTitle}>Départs</h1>
        {schedules.length >= 5 && (
          <div className={styles.paginationDots}>
            <div className={`${styles.dot} ${currentPage === 0 ? styles.active : ''}`}>1</div>
            <div className={`${styles.dot} ${currentPage === 1 ? styles.active : ''}`}>2</div>
          </div>
        )}
        <time className={styles.headerTime} dateTime={new Date().toISOString()}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </header>
      <main className={styles.aflContainer} role="main" aria-label="Tableau des départs">
        <ul className={styles.scheduleList} role="list">
          {schedulesToDisplay.map((schedule, index) => {
            const globalIndex = currentPage === 0 ? index : index + 4;
            const status = getTrainStatus(schedule);
            const isEven = globalIndex % 2 === 0;
            const displayTime = getStationTime(schedule, gare, 'departure', false);
            let statusCode = 'on_time';
            if (schedule.isCancelled) {
              statusCode = 'canceled';
            } else if (schedule.delayMinutes && schedule.delayMinutes > 0) {
              statusCode = 'delayed';
            }
            const delayMinutes = schedule.delayMinutes || 0;

            // Determine if the vehicle is a bus or train for icon display
            const isBus = schedule.trainType && schedule.trainType.toLowerCase().includes('bus');

            // Compose the "via" route with arrows and bold intermediate stations
            const viaStations = schedule.servedStations && schedule.servedStations.length > 0 ? schedule.servedStations : [];

            // Extract stations after current gare
            let stationsAfterGare = [];
            if (viaStations.length > 0) {
              const normalizedStations = viaStations.map(station => (typeof station === 'object' ? station.name : station));
              const startIndex = normalizedStations.indexOf(gare);
              if (startIndex !== -1) {
                stationsAfterGare = normalizedStations.slice(startIndex + 1);
              } else {
                stationsAfterGare = normalizedStations;
              }
            }

            return (
              <li
                key={schedule.id || globalIndex}
                className={styles.scheduleRow + ' ' + (isEven ? styles.scheduleRowEven : styles.scheduleRowOdd)}
                role="listitem"
              >
                <section className={styles.leftSection}>
                  {globalIndex < 4 ? (
                    <>
                      <time className={styles.departureTime} dateTime={displayTime} style={{ color: '#dfff00', fontWeight: '900' }}>
                        {formatTimeHHmm(displayTime)}
                      </time>
                      <div className={styles.statusBadge} style={{ backgroundColor: (() => {
                  if (statusCode === 'on_time') return '#0057b8'; // blue
                  if (statusCode === 'delayed') return '#ff7f50'; // coral for delayed
                  if (statusCode === 'canceled') return '#cf0a0a'; // canceled Red
                  return '#0057b8';
                })() }}>
                  {statusCode === 'on_time' && (
                    <>
                      <svg viewBox="0 0 500 500" style={{ height: '1.8rem', width: '2rem', marginRight: '1rem', display: 'block', marginTop: 'auto', marginBottom: 'auto' }} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="250" cy="250" r="260" fill="#ffffff" />
                        <path d="M493.0162,131.3881,167.6317,431.1571c-8.14,7.3934-21.2841,7.3934-29.0509,0L6.9931,310.1741a17.9886,17.9886,0,0,1,0-26.81l38.7594-35.8468c8.29-7.1694,21.2094-7.1694,28.9762,0l63.7774,58.3257c7.7669,7.4681,20.9107,7.4681,29.0509,0l257.5-237.1117a22.0339,22.0339,0,0,1,28.9762,0l38.9087,35.7721a18.0157,18.0157,0,0,1,.0747,26.8851Z" fill="#0057b8" />
                      </svg>
                      <span>à l'heure</span>
                    </>
                  )}
                  {statusCode === 'delayed' && (
                    <>
                      <svg viewBox="0 0 500 500" style={{ height: '1.8rem', width: '2rem', marginRight: '1rem', marginLeft: '0.3rem', display: 'block', marginTop: 'auto', marginBottom: 'auto' }} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg">
                        <path d="M250,116.7c-73.5,0-133.3,59.8-133.3,133.3S176.5,383.3,250,383.3,383.3,323.5,383.3,250,323.5,116.7,250,116.7Zm70.5,202.2-87.9-52.3v-100h25v87.9l75,44.7-12.1,19.7Z" 
                        fill="#ffffff" />
                        <path d="M250,1C112.6516,1,1,112.6516,1,250S112.6516,499,250,499,499,387.3484,499,250,387.3484,1,250,1Zm0,415.0332c-91.3332,0-166.0332-74.7-166.0332-166.0332S157.97,83.9668,250,83.9668,416.0332,158.6668,416.0332,250,341.3332,416.0332,250,416.0332Z" 
                        fill="#ff7f50" />
                      </svg>
                      {showStatus ? <span>Retardé</span> : <span>+ {schedule.delayMinutes} min</span>}
                    </>
                  )}

                  {statusCode === 'canceled' && (
                    <>
                      <svg viewBox="0 0 500 500">
<path d="M250,1C112.6516,1,1,112.6516,1,250S112.6516,499,250,499,499,387.3484,499,250,387.3484,1,250,1ZM374.5,182.87V312.6484c0,30.1788-24.1032,55.0788-54.282,55.0788l23.406,23.406v7.57H312.6484L281.6728,367.03H222.8092l-30.9756,31.6728H157.1728v-7.57l23.406-23.406c-18.1272,0-33.9636-9.0636-44.5212-23.406l-42.23,28.6848a12.2764,12.2764,0,0,1-6.7728,2.2908c-3.7848,0-7.57-2.2908-10.5576-5.2788-3.7848-6.0756-2.2908-13.5456,2.988-17.33l46.812-31.6728a29.136,29.136,0,0,1-.7968-8.2668v-149.4C125.5,108.2692,187.3516,100.7,250,100.7c64.1424,0,116.2332,7.57,123.006,52.788L413.7424,125.6c6.0756-3.7848,13.5456-2.2908,17.33,2.988,3.7847,6.0756,2.2907,13.5456-2.988,17.33Z" 
fill="#ffffff"/>
<path d="M161.4,327.3c4.5,5.3,10.6,9.1,18.2,9.1a23.6015,23.6015,0,0,0,23.5-23.5,25.8783,25.8783,0,0,0-3-11.4Z" fill="#ffffff"/>
<circle cx="320.5" cy="312.9" r="23.5" fill="#ffffff"/>
<path d="M156.1,162.9h78v62.9h-78Zm109.8,63.6,78-53V162.9h-78Zm78,0V203.8l-33.3,22.7Z" fill="#ffffff"/>
</svg>
                      <span>Supprimé</span>
                    </>
                  )}
                </div>
                    </>
                  ) : (
                    <time className={styles.departureTime} dateTime={displayTime} style={{ color: '#dfff00', fontWeight: '900' }}>
                      {formatTimeHHmm(displayTime)}
                    </time>
                  )
                )}
              </section>
              <section className={styles.trainInfo}>
                <div>{schedule.trainType || ''}</div>
                <div>{schedule.trainNumber || ''}</div>
              </section>
              <section className={styles.middleSection}>
                <div className={styles.destinationRow} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {isBus ? (
                    <i className="bi bi-bus-front-fill" aria-label="Bus" role="img"></i>
                  ) : (
                    <i className="bi bi-train-front-fill" aria-label="Train" role="img"></i>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>{schedule.arrivalStation}</div>
                    {(statusCode === 'delayed' || statusCode === 'canceled') && (schedule.cause || schedule.cause === '') && (
                      <div
                        className={styles.causeBadge}
                        style={{
                          backgroundColor: statusCode === 'canceled' ? '#cf0a0a' : '#ff7f50',
                        }}
                        aria-label={`Cause: ${schedule.cause || ''}`}
                      >
                        {schedule.cause || ''}
                      </div>
                    )}
                  </div>
                </div>
                {currentPage === 0 && (
                  <div className={styles.viaRow}>
                    <span>via</span>
                    <div
                      className={styles.scrollContainer}
                      ref={scrollContainerRef}
                    >
                      <div className={styles.scrollContent}>
                        {stationsAfterGare.map((station, idx) => (
                          <span key={idx} className={idx === 0 ? styles.bold : ''}>
                            {station}
                            {idx < stationsAfterGare.length - 1 && <span className={styles.arrow}>{'>'}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
              <section className={styles.rightSection} aria-label="Voie">
                <div className={styles.label}>Voie</div>
                {statusCode === 'canceled' ? (
                  <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%' }} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg">
                    <path d="M329.182,250,483.1636,96.1178c21.1152-21.1152,21.1152-58.0668,0-79.182s-58.0668-21.1152-79.182,0L250,170.8178,96.118,16.8362c-21.1152-21.1152-58.0668-21.1152-79.182,0s-21.1152,58.0668,0,79.182L170.818,250,16.8364,403.8818c-21.1152,21.1152-21.1152,58.0668,0,79.182s58.0668,21.1152,79.182,0L250,329.1818l153.882,153.882c21.1152,21.1152,58.0668,21.1152,79.182,0s21.1152-58.0668,0-79.182Z"
                    fill="#cf0a0a"/>
                  </svg>
                ) : (
                  <div>{trackAssignments[schedule.id]?.[gare] || schedule.track || '-'}</div>
                )}
              </section>
            </li>
          );
        })}
      </ul>
    </main>
  </div>
);
}
