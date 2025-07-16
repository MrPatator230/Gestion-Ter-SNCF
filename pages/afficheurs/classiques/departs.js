import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './Afficheurs.module.css';
import defilementStyles from './defilement.module.css';

import { filterSchedulesByType, sortSchedulesByTime, getTrainStatus, getStationTime } from '../../../utils/scheduleUtils';
import trainTypeLogos from '../../../data/trainTypeLogos.json';

// Helper function to format time string "HH:mm" to 'HH"h"mm'
const formatTimeHHhmm = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}h${minutes}`;
};

// Bottom information bar component
const BottomInfoBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setShowColon((prev) => !prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClockTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return (
      <>
        {hours}
        <span style={{ opacity: showColon ? 1 : 0 }}>:</span>
        {minutes}
      </>
    );
  };

  const formatClockSeconds = (date) => {
    return date.getSeconds().toString().padStart(2, '0');
  };

  return (
    <div className={styles.bottomInfoBar}>
      <div className={styles.clockContainer}>
        <div className={styles.clockTime}>{formatClockTime(currentTime)}</div>
        <div className={styles.clockSeconds}>{formatClockSeconds(currentTime)}</div>
      </div>
    </div>
  );
};

export default function DeparturesAfficheur() {
  const router = useRouter();
  let { gare, type } = router.query;


  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrainType, setShowTrainType] = useState(true);
  const [stationType, setStationType] = useState('Ville'); // default to 'ville'

  // Determine lines per page based on type query parameter
  const linesPerPage = type === 'normal' ? 9 : type === 'defilement' ? 20 : 10;

  const scheduleListRef = useRef(null);

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    return days[now.getDay()];
  };

  useEffect(() => {
    async function fetchData() {
      if (!gare) {
        setSchedules([]);
        setLoading(false);
        return;
      }
      try {
        // Fetch station info to get stationType
        const stationRes = await fetch(`/api/stations?name=${gare}`);
        if (stationRes.ok) {
          const stationData = await stationRes.json();
          setStationType((stationData.locationType || 'Ville').toLowerCase());
        } else {
          setStationType('Ville'); // fallback
        }

        // Fetch schedules
        const res = await fetch(`/api/schedules/by-station?station=${gare}`);
        if (!res.ok) throw new Error(`API request failed: ${res.status}`);
        const allSchedules = await res.json();

        const schedulesWithParsedData = allSchedules.map(s => ({
          ...s,
          joursCirculation: s.joursCirculation && typeof s.joursCirculation === 'string' ? JSON.parse(s.joursCirculation) : s.joursCirculation || [],
        }));

        // Temporarily disable filtering by type and day to debug Dijon schedules display
         const filteredByType = filterSchedulesByType(schedulesWithParsedData, gare, 'departures');
         const currentDay = getCurrentDay();
         const filteredByDay = filteredByType.filter(schedule => {
           if (!schedule.joursCirculation || schedule.joursCirculation.length === 0) return true;
           return schedule.joursCirculation.includes(currentDay);
         });
         

        // Use all schedules without filtering
        const sorted = sortSchedulesByTime(schedulesWithParsedData, gare, 'departures');
        setSchedules(sorted);
      } catch (error) {
        console.error('Failed to fetch schedules or station info:', error);
        setSchedules([]);
        setStationType('Ville');
      }
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [gare]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTrainType(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!gare) {
    return (
      <main className={styles.afficheursContainer}>
        <p className={styles.errorMessage}>Gare non spécifiée.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={`${styles.afficheursContainer} ${styles.departuresBackground}`}>
        <p className={styles.loadingMessage}>Chargement...</p>
      </main>
    );
  }

  if (schedules.length === 0) {
    return (
      <main className={`${styles.afficheursContainer} ${styles.departuresBackground}`}>
        <p className={styles.noSchedulesMessage}>Aucun départ prévu pour cette gare.</p>
        <BottomInfoBar />
      </main>
    );
  }

  const now = new Date();
  const currentTimeStr = now.toTimeString().slice(0, 5);

  // Helper to convert "HH:mm" to minutes since midnight
  const timeStrToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Determine threshold in minutes based on stationType
  let thresholdMinutes;
  if (stationType === 'ville') {
    thresholdMinutes = 30; // 30 minutes for city stations
  } else if (stationType === 'interurbain') {
    thresholdMinutes = 12 * 60; // 12 hours for interurban stations
  } else {
    thresholdMinutes = 30; // Default to 30 minutes
  }

  const filteredSchedules = schedules.filter(schedule => {
    const scheduleTime = getStationTime(schedule, gare, 'departure');
    if (!scheduleTime) return false;
    const scheduleMinutes = timeStrToMinutes(scheduleTime);
    const nowMinutes = timeStrToMinutes(currentTimeStr);
    // Filter to only show trains departing in the future
    return scheduleMinutes >= nowMinutes;
  });

  const displayedSchedules = filteredSchedules.slice(0, linesPerPage);

  return (
    <main className={`${styles.afficheursContainer} ${styles.departuresBackground}`}>
      <div className={styles.watermarkContainer}>
        <img 
          src="/components/afficheurs/row-background-departures.svg" 
          alt="Watermark" 
          className={styles.watermarkSVG}
        />
      </div>
      <div className={`${styles.scheduleListContainer} ${type === 'normal' ? styles.noScroll : ''}`}>
        <ul
          ref={scheduleListRef}
          className={`${styles.scheduleList} ${type === 'defilement' ? defilementStyles.scrollingList : ''}`}
        >
          {displayedSchedules.map((schedule, index) => {
            const status = getTrainStatus(schedule);
            const displayTime = getStationTime(schedule, gare, 'departure');
            const isEven = index % 2 === 0;

            const getPlatform = () => {
              const scheduleTime = getStationTime(schedule, gare, 'departure');
              if (scheduleTime) {
                const scheduleMinutes = timeStrToMinutes(scheduleTime);
                const nowMinutes = timeStrToMinutes(currentTimeStr);

                if (scheduleMinutes >= nowMinutes && (scheduleMinutes - nowMinutes) <= thresholdMinutes) {
                  try {
                    if (schedule.trackAssignments) {
                      const assignments = typeof schedule.trackAssignments === 'string' ? JSON.parse(schedule.trackAssignments) : schedule.trackAssignments;
                      if (assignments && typeof assignments === 'object' && assignments[gare]) {
                        return assignments[gare];
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing trackAssignments:', e);
                  }
                  return schedule.track || null;
                }
              }
              return null;
            };

            const platformToDisplay = getPlatform();

            let stationsList = [];
            if (schedule.servedStations && schedule.servedStations.length > 0) {
              const normalizedStations = schedule.servedStations.map(station =>
                typeof station === 'object' ? station.name : station
              );
              const selectedStationIndex = normalizedStations.indexOf(gare);
              if (selectedStationIndex !== -1) {
                stationsList = normalizedStations.slice(selectedStationIndex + 1);
              } else {
                stationsList = normalizedStations;
              }
            }

            return (
              <li
                key={`${schedule.id}-${index}`}
                className={`${styles.scheduleRow} ${isEven ? styles.scheduleRowEven : styles.scheduleRowOdd} ${
                  index < 2 ? styles.firstTwoRows : ''
                }`}
              >
                <section className={styles.leftSection}>
                  <div className={styles.sncfLogoContainer}>
                    <Image
                      src={trainTypeLogos[schedule.trainType] || '/sncf-logo.png'}
                      alt={schedule.trainType || 'SNCF'}
                      fill
                      sizes="100px"
                    />
                  </div>
                  <div className={styles.statusText}>
                    {showTrainType ? (
                      <>
                        <div className={styles.statusText}>{schedule.trainType || ''}</div>
                        <div className={styles.trainNumber}>
                          {schedule.trainNumber || schedule.train || schedule.trainId || ''}
                        </div>
                      </>
                    ) : (
                      <div>
                        {status.status === 'ontime'
                          ? "à l'heure"
                          : status.status === 'delayed'
                          ? `Retard ${schedule.delayMinutes}min`
                          : 'Supprimé'}
                      </div>
                    )}
                  </div>
                  <time className={styles.departureTime} dateTime={displayTime}>
                    {formatTimeHHhmm(displayTime)}
                  </time>
                </section>

                <section className={styles.middleSection}>
                  <div className={`${styles.destination} ${schedule.arrivalStation.length > 15 ? styles.scrollDestination : ''}`}>
                    <div className={schedule.arrivalStation.length > 15 ? styles.destinationScroll : ''}>
                      {schedule.arrivalStation}
                    </div>
                  </div>
                  {index < 2 && stationsList.length > 0 && (
                    <div className={styles.servedStations}>
                      <div className={styles.marquee}>
                        <div className={styles.marqueeContent}>
                          {stationsList.map((station, idx) => (
                            <span key={idx}>
                              {station}
                              {idx < stationsList.length - 1 && <span className={styles.dotSeparator}> • </span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
                <section className={styles.rightSection}>
                  {platformToDisplay && (
                    <div className={styles.platform}>
                      {platformToDisplay}
                    </div>
                  )}
                </section>
              </li>
            );
          })}
        </ul>
      </div>
      <BottomInfoBar />
    </main>
  );
}
