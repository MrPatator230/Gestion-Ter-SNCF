import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './Afficheurs.module.css';
import { getStationSchedules, filterSchedulesByType, sortSchedulesByTime, getTrainStatus, getStationTime, getNextDay, filterSchedulesByDay } from '../../../utils/scheduleUtils';
import { useTrackAssignments } from '../../../src/contexts/TrackAssignmentContext';
import Link from 'next/link';
import { SettingsContext } from '../../../contexts/SettingsContext';

// Helper function to get current day string in English (e.g., 'Monday')
const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  return days[now.getDay()];
};

// Helper function to format time string "HH:mm" to 'HH"h"mm'
const formatTimeHHhmmQuoted = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};


export default function AfficheursPublic() {
  const router = useRouter();
  const { gare, type } = router.query; // type can be 'departures' or 'arrivals'

  const { servedStationsLines } = useContext(SettingsContext);

  const trackAssignmentsContext = useTrackAssignments();
  const trackAssignments = trackAssignmentsContext ? trackAssignmentsContext.trackAssignments : {};

  const [schedules, setSchedules] = useState([]);
  const [nextDaySchedules, setNextDaySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trainTypeLogos, setTrainTypeLogos] = useState({});
  const [displayPage, setDisplayPage] = useState(0);
  const [stationInfo, setStationInfo] = useState(null);

  const LINES_PER_PAGE = 10;
  const DISPLAY_TIME_MS = 10000; // 10 seconds

  // Mapping to normalize trainType strings to keys in trainTypeLogos
  const trainTypeMapping = {
    'TER': 'TER',
    'TGV InOui': 'TGV InOui',
    'TGV Lyria': 'TGV Lyria',
    'TGV Ouigo': 'TGV Ouigo',
    'OUIGO Trains Classiques': 'OUIGO Trains Classiques',
    'Intercités': 'Intercités',
    'MOBIGO': 'MOBIGO',
    'Car TER': 'Car TER',
    // Add more mappings or aliases if needed
  };

  useEffect(() => {
    let intervalId;

    async function fetchTrainTypeLogos() {
      try {
        const res = await fetch('/api/trainTypeLogos');
        if (res.ok) {
          const data = await res.json();
          setTrainTypeLogos(data);
        }
      } catch (error) {
        console.error('Failed to fetch train type logos:', error);
      }
    }

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
      if (gare && (type === 'departures' || type === 'arrivals')) {
        try {
          const res = await fetch(`/api/schedules/by-station?station=${gare}`);
          if (!res.ok) {
            throw new Error(`API request failed: ${res.status}`);
          }
          
          let allSchedules = await res.json();

          // The API may return stringified JSON for some fields, so we parse them.
          const schedulesWithParsedData = allSchedules.map(s => {
            try {
              return {
                ...s,
                joursCirculation: s.joursCirculation && typeof s.joursCirculation === 'string' ? JSON.parse(s.joursCirculation) : s.joursCirculation || [],
              };
            } catch (e) {
              console.warn(`Failed to parse data for schedule ${s.id}`, e);
              return { ...s, joursCirculation: [] }; // Fallback
            }
          });

          const filteredByType = filterSchedulesByType(schedulesWithParsedData, gare, type);

          // Filter schedules by current day of operation
          const currentDay = getCurrentDay();
          const filteredByDay = filterSchedulesByDay(filteredByType, currentDay);

          const sorted = sortSchedulesByTime(filteredByDay, gare, type);
          setSchedules(sorted);

          // Get next day schedules
          const nextDay = getNextDay(currentDay);
          if (nextDay) {
            const filteredNextDay = filterSchedulesByDay(filteredByType, nextDay);
            const sortedNextDay = sortSchedulesByTime(filteredNextDay, gare, type);
            setNextDaySchedules(sortedNextDay);
          } else {
            setNextDaySchedules([]);
          }
        } catch (error) {
          console.error('Failed to fetch schedules:', error);
          setSchedules([]);
          setNextDaySchedules([]);
        }
        setLoading(false);
      } else {
        setSchedules([]);
        setNextDaySchedules([]);
        setLoading(false);
      }
    }

    async function fetchData() {
      await fetchTrainTypeLogos();
      await fetchStationInfo();
      await fetchSchedules();
    }

    fetchData();

    intervalId = setInterval(fetchData, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [gare, type]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayPage(prev => {
        if (schedules.length === 0) return 0;
        return (prev + 1) % Math.ceil(schedules.length / LINES_PER_PAGE);
      });
    }, DISPLAY_TIME_MS);
    return () => clearInterval(interval);
  }, [schedules]);

  if (!gare) {
    return (
      <main className={styles.afficheursContainer} role="main">
        <p className={styles.errorMessage}>Paramètre gare manquant. Veuillez fournir la gare dans l'URL.</p>
      </main>
    );
  }

  if (!type || (type !== 'departures' && type !== 'arrivals')) {
    return (
      <main className={styles.afficheursContainer} role="main">
        <p className={styles.errorMessage}>Paramètre type manquant ou invalide. Utilisez 'departures' ou 'arrivals'.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.afficheursContainer} role="main" aria-label={`Tableau des ${type}`}>
        <p className={styles.loadingMessage}>Chargement...</p>
      </main>
    );
  }

  if (schedules.length === 0) {
    return (
      <main className={styles.afficheursContainer} role="main" aria-label={`Tableau des ${type}`}>
        <p className={styles.noSchedulesMessage}>Aucun horaire trouvé pour cette gare.</p>
      </main>
    );
  }

  // Pagination slice
  const startIndex = displayPage * LINES_PER_PAGE;
  const endIndex = startIndex + LINES_PER_PAGE;
  const schedulesToDisplay = schedules.slice(startIndex, endIndex);

  return (
    <main
      className={`${styles.afficheursContainer} ${type === 'departures' ? styles.departuresBackground : styles.arrivalsBackground}`}
      role="main"
      aria-label={`Tableau des ${type}`}
    >
      <ul className={styles.scheduleList} role="list">
        {schedulesToDisplay.map((schedule, index) => {
          const status = getTrainStatus(schedule);
          const rawTrainType = schedule.trainType || 'MOBIGO';
          const normalizedTrainType = trainTypeMapping[rawTrainType] || 'MOBIGO';
          const logoSrc = trainTypeLogos[normalizedTrainType] || '/images/sncf-logo.png';
          const isEven = index % 2 === 0;
          const displayTime = getStationTime(schedule, gare, type === 'departures' ? 'departure' : 'arrival');

          // Extract the status code string from the status object
          const statusCode = status.status;

          // Calculate delayed time string
          const getDelayedTime = () => {
            if (!schedule.delayMinutes || schedule.delayMinutes <= 0) return null;
            const [hours, minutes] = displayTime.split(':').map(Number);
            let date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes + schedule.delayMinutes);
            const delayedHours = date.getHours().toString().padStart(2, '0');
            const delayedMinutes = date.getMinutes().toString().padStart(2, '0');
            return `${delayedHours}:${delayedMinutes}`;
          };

          const delayedTime = getDelayedTime();

          // Determine if the schedule should be hidden 2 minutes before departure or if arrival time has passed except for last train
          const now = new Date();
          const [hours, minutes] = displayTime.split(':').map(Number);
          const scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
          const diffMinutes = (scheduleDate - now) / 60000;

          // Identify last schedule of the day
          const lastSchedule = schedules[schedules.length - 1];
          const lastDisplayTime = getStationTime(lastSchedule, gare, type === 'departures' ? 'departure' : 'arrival');
          const [lastHours, lastMinutes] = lastDisplayTime.split(':').map(Number);
          const lastScheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lastHours, lastMinutes);

          if ((diffMinutes < 2 && diffMinutes >= 0) || (diffMinutes < 0 && scheduleDate.getTime() !== lastScheduleDate.getTime())) {
            return null; // Hide the schedule row
          }

          // Served stations list logic
          let stationsList = [];
          if (schedule.servedStations && schedule.servedStations.length > 0) {
            const normalizedStations = schedule.servedStations.map((station) =>
              typeof station === 'object' ? station.name : station
            );
            const selectedStationIndex = normalizedStations.indexOf(gare);
            if (type === 'departures') {
              if (selectedStationIndex !== -1) {
                stationsList = normalizedStations.slice(selectedStationIndex + 1);
              } else {
                stationsList = normalizedStations;
              }
            } else if (type === 'arrivals') {
              if (selectedStationIndex !== -1) {
                stationsList = normalizedStations.slice(0, selectedStationIndex);
              } else {
                stationsList = normalizedStations;
              }
            }
          }

          // Platform display logic
          const locationType = stationInfo?.locationType || 'Ville';
          const showPlatformTime = locationType === 'Ville' ? 20 : 720; // 20 minutes for Ville, 720 minutes (12h) for Interurbain
          const showPlatform = diffMinutes <= showPlatformTime && diffMinutes >= 0;
          const platform = showPlatform ? (trackAssignments[schedule.id]?.[gare] || schedule.track || '-') : '';

          return (
            <li
              key={schedule.id}
              className={`${styles.scheduleRow} ${isEven ? styles.scheduleRowEven : styles.scheduleRowOdd}`}
              role="listitem"
            >
              <section className={styles.leftSection}>
                <div className={styles.sncfLogoContainer}>
                  <Image src={logoSrc} alt={normalizedTrainType} layout="fill" objectFit="contain" />
                </div>
                <div className={styles.alternatingTextContainer}>
                  <div className={styles.trainTypeNameContainer}>
                    <div className={styles.trainTypeText}>{normalizedTrainType}</div>
                    <div className={styles.trainNumberText}>{schedule.trainNumber || ''}</div>
                  </div>
                  {statusCode === 'ontime' && <div className={styles.statusText}>à l&apos;heure</div>}
                  {statusCode === 'delayed' && <div className={styles.statusText}>Retardé</div>}
                  {statusCode === 'cancelled' && <div className={styles.statusText}>Supprimé</div>}
                </div>
                <time className={styles.departureTime} dateTime={displayTime} style={{ color: '#ffea00' }}>
                  {formatTimeHHhmmQuoted(displayTime)}
                </time>
              </section>
              <section className={styles.middleSection}>
                <div className={styles.destination}>
                  {type === 'departures' ? schedule.arrivalStation : schedule.departureStation}
                </div>
                {stationsList.length > 0 && (
                  <div className={styles.servedStations}>
                    <div className={styles.marquee} aria-label="Liste des gares desservies" role="list">
                      <div className={styles.marqueeContent}>
                        {stationsList.map((station, idx) => (
                          <span key={idx} className={styles.stationName} role="listitem">
                            {idx > 0 && <span className={styles.dotSeparator} aria-hidden="true">•</span>}
                            {station}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
              <div
                className={styles.rightSection}
                aria-hidden={!showPlatform}
              >
                {platform}
              </div>
            </li>
          );
        })}
      </ul>
      {displayPage === 0 && nextDaySchedules.length > 0 && (
        <section className={styles.nextDaySection}>
          <p className={styles.nextDayText}>Les prochains {type} auront lieu demain.</p>
          <ul className={styles.scheduleList} role="list">
            {nextDaySchedules.slice(0, LINES_PER_PAGE).map((schedule, index) => {
              const status = getTrainStatus(schedule);
              const rawTrainType = schedule.trainType || 'MOBIGO';
              const normalizedTrainType = trainTypeMapping[rawTrainType] || 'MOBIGO';
              const logoSrc = trainTypeLogos[normalizedTrainType] || '/images/sncf-logo.png';
              const isEven = index % 2 === 0;
              const displayTime = getStationTime(schedule, gare, type === 'departures' ? 'departure' : 'arrival');
              const statusCode = status.status;

              return (
                <li
                  key={schedule.id}
                  className={`${styles.scheduleRow} ${isEven ? styles.scheduleRowEven : styles.scheduleRowOdd}`}
                  role="listitem"
                >
                  <section className={styles.leftSection}>
                    <div className={styles.sncfLogoContainer}>
                      <Image src={logoSrc} alt={normalizedTrainType} layout="fill" objectFit="contain" />
                    </div>
                    <div className={styles.alternatingTextContainer}>
                      <div className={styles.trainTypeNameContainer}>
                        <div className={styles.trainTypeText}>{normalizedTrainType}</div>
                        <div className={styles.trainNumberText}>{schedule.trainNumber || ''}</div>
                      </div>
                      {statusCode === 'ontime' && <div className={styles.statusText}>à l&apos;heure</div>}
                      {statusCode === 'delayed' && <div className={styles.statusText}>Retardé</div>}
                      {statusCode === 'cancelled' && <div className={styles.statusText}>Supprimé</div>}
                    </div>
                    <time className={styles.departureTime} dateTime={displayTime} style={{ color: '#ffea00' }}>
                      {formatTimeHHhmmQuoted(displayTime)}
                    </time>
                  </section>
                  <section className={styles.middleSection}>
                    <div className={styles.destination}>
                      {type === 'departures' ? schedule.arrivalStation : schedule.departureStation}
                    </div>
                    {schedule.servedStations && schedule.servedStations.length > 0 && (
                      <div className={styles.servedStations}>
                        <div className={styles.marquee} aria-label="Liste des gares desservies" role="list">
                          <div className={styles.marqueeContent}>
                            {(() => {
                              const normalizedStations = schedule.servedStations.map((station) =>
                                typeof station === 'object' ? station.name : station
                              );
                              const selectedStationIndex = normalizedStations.indexOf(gare);
                              let stationsList = [];
                              if (type === 'departures') {
                                if (selectedStationIndex !== -1) {
                                  stationsList = normalizedStations.slice(selectedStationIndex + 1);
                                } else {
                                  stationsList = normalizedStations;
                                }
                              } else if (type === 'arrivals') {
                                if (selectedStationIndex !== -1) {
                                  stationsList = normalizedStations.slice(0, selectedStationIndex);
                                } else {
                                  stationsList = normalizedStations;
                                }
                              }
                              return stationsList.map((station, idx) => (
                                <span key={idx} className={styles.stationName} role="listitem">
                                  {idx > 0 && <span className={styles.dotSeparator} aria-hidden="true">•</span>}
                                  {station}
                                </span>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                  <div
                    className={styles.rightSection}
                    aria-hidden={true}
                  >
                    {trackAssignments[schedule.id]?.[gare] || schedule.track || '-'}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
