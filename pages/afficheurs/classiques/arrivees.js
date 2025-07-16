import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './Arrivals.module.css';
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

export default function ArrivalsAfficheur() {
  const router = useRouter();
  const { gare, type } = router.query;

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrainType, setShowTrainType] = useState(true);

  // Determine lines per page based on type query parameter
  const linesPerPage = type === 'normal' ? 9 : type === 'defilement' ? 20 : 10;

  const scheduleListRef = useRef(null);

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    return days[now.getDay()];
  };

  useEffect(() => {
    async function fetchSchedules() {
      if (!gare) {
        setSchedules([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/schedules/by-station?station=${gare}`);
        if (!res.ok) throw new Error(`API request failed: ${res.status}`);
        const allSchedules = await res.json();

        const schedulesWithParsedData = allSchedules.map(s => ({
          ...s,
          joursCirculation: s.joursCirculation && typeof s.joursCirculation === 'string' ? JSON.parse(s.joursCirculation) : s.joursCirculation || [],
        }));

        const filteredByType = filterSchedulesByType(schedulesWithParsedData, gare, 'arrivals');
        const currentDay = getCurrentDay();
        const filteredByDay = filteredByType.filter(schedule => {
          if (!schedule.joursCirculation || schedule.joursCirculation.length === 0) return true;
          return schedule.joursCirculation.includes(currentDay);
        });
        const sorted = sortSchedulesByTime(filteredByDay, gare, 'arrivals');
        setSchedules(sorted);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
        setSchedules([]);
      }
      setLoading(false);
    }

    fetchSchedules();
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
      <main className={`${styles.afficheursContainer} ${styles.arrivalsBackground}`}>
        <p className={styles.loadingMessage}>Chargement...</p>
      </main>
    );
  }

  if (schedules.length === 0) {
    return (
      <main className={`${styles.afficheursContainer} ${styles.arrivalsBackground}`}>
        <p className={styles.noSchedulesMessage}>Aucune arrivée prévue pour cette gare.</p>
        <BottomInfoBar />
      </main>
    );
  }

  const now = new Date();
  const currentTimeStr = now.toTimeString().slice(0, 5);

  const filteredSchedules = schedules.filter(schedule => {
    const scheduleTime = getStationTime(schedule, gare, 'arrival');
    return scheduleTime >= currentTimeStr;
  });

  const displayedSchedules = filteredSchedules.slice(0, linesPerPage);

  return (
    <main className={`${styles.afficheursContainer} ${styles.arrivalsBackground}`}>
      <div className={styles.watermarkContainer}>
        <img 
          src="/components/afficheurs/row-background-arrivals.svg" 
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
            const displayTime = getStationTime(schedule, gare, 'arrival');
            const isEven = index % 2 === 0;

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
                  <div className={styles.destination}>{schedule.departureStation}</div>
                  {index < 2 && (
                    <div className={styles.allOriginStations}>
                      {(() => {
                        const stations = [];
                        // Add departure station as first station
                        stations.push(schedule.departureStation);
                        
                        // Add served stations in reverse order (from arrival to departure)
                        if (schedule.servedStations) {
                          try {
                            const served = typeof schedule.servedStations === 'string' 
                              ? JSON.parse(schedule.servedStations) 
                              : schedule.servedStations;
                            
                            if (Array.isArray(served)) {
                              // Get stations before the current station in reverse order
                              const currentStationIndex = served.findIndex(s => s.name === gare);
                              if (currentStationIndex > 0) {
                                const previousStations = served
                                  .slice(0, currentStationIndex)
                                  .reverse()
                                  .map(s => s.name);
                                stations.push(...previousStations);
                              }
                            }
                          } catch (e) {
                            console.error('Error parsing served stations:', e);
                          }
                        }
                        
                        // Remove duplicates and current station
                        const uniqueStations = [...new Set(stations)].filter(s => s !== gare);
                        
                        return uniqueStations.join(' - ');
                      })()}
                    </div>
                  )}
                </section>
                <section className={styles.rightSection}>
                  <div className={styles.platform}>
                    {(() => {
                      try {
                        if (schedule.trackAssignments) {
                          const assignments = typeof schedule.trackAssignments === 'string' ? JSON.parse(schedule.trackAssignments) : schedule.trackAssignments;
                          if (assignments && typeof assignments === 'object') {
                            if (assignments[gare]) {
                              return assignments[gare];
                            }
                          }
                        }
                      } catch (e) {
                        console.error('Error parsing trackAssignments:', e);
                      }
                      return schedule.track || '-';
                    })()}
                  </div>
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
