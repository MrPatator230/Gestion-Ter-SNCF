import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './QuaiDepart.module.css';
import ClockDisplay from '../../../../components/afficheurs/ClockDisplay';
import { getTrainStatus, getStationTime } from '../../../../utils/scheduleUtils';
import trainTypeLogos from '../../../../data/trainTypeLogos.json';

export default function QuaiDepart() {
  const router = useRouter();
  const { gare, quai } = router.query;

  const [schedule, setSchedule] = useState(null);
  const [departureTime, setDepartureTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    async function fetchSchedule() {
      if (!gare || !quai) {
        setSchedule(null);
        setDepartureTime(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/schedules/by-station?station=${gare}`);
        if (!res.ok) throw new Error(`API request failed: ${res.status}`);
        const schedules = await res.json();

        // Filter schedules by quai and gare
        const filteredSchedules = schedules.filter(s => {
          if (!s.departureTime) return false;
          
          // Check if trackAssignments for gare matches quai
          if (!s.trackAssignments || !s.trackAssignments[gare]) return false;
          if (s.trackAssignments[gare] !== quai) return false;
          
          // Check if gare is departureStation or in servedStations
          const servedStations = s.servedStations || [];
          const normalizedStations = servedStations.map(station => (typeof station === 'object' ? station.name : station));
          return s.departureStation === gare || normalizedStations.includes(gare);
        });

        if (filteredSchedules.length > 0) {
          const getDepartureTimeForGare = (schedule, gareName) => {
            if (!schedule || !gareName) return null;
            
            try {
              if (schedule.departureStation === gareName) {
                return schedule.departureTime;
              }
              if (schedule.servedStations) {
                const served = typeof schedule.servedStations === 'string' 
                  ? JSON.parse(schedule.servedStations) 
                  : schedule.servedStations;
                
                if (Array.isArray(served)) {
                  const stationInfo = served.find(s => {
                    const stationName = typeof s === 'object' ? s.name : s;
                    return stationName === gareName;
                  });
                  
                  if (stationInfo && typeof stationInfo === 'object') {
                    return stationInfo.time || stationInfo.departureTime || null;
                  } else if (typeof stationInfo === 'string') {
                    return stationInfo;
                  }
                }
              }
              return null;
            } catch (error) {
              console.error('Error in getDepartureTimeForGare:', error);
              return null;
            }
          };

          const now = new Date();
          const upcoming = filteredSchedules
            .map(s => {
              const time = getDepartureTimeForGare(s, gare);
              if (!time) return null;
              
              try {
                const [hours, minutes] = time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) return null;
                
                const departureDate = new Date();
                departureDate.setHours(hours, minutes, 0, 0);
                
                // Handle edge case where departure is next day
                if (departureDate < now && departureDate.getHours() < 6) {
                  departureDate.setDate(departureDate.getDate() + 1);
                }
                
                if (departureDate < now) return null;
                return { schedule: s, departureTime: time, date: departureDate };
              } catch (error) {
                console.error('Error parsing time:', time, error);
                return null;
              }
            })
            .filter(Boolean);

          if (upcoming.length > 0) {
            upcoming.sort((a, b) => a.date - b.date);
            const next = upcoming[0];
            setSchedule(next.schedule);
            setDepartureTime(next.departureTime);
          } else {
            setSchedule(null);
            setDepartureTime(null);
          }
        } else {
          setSchedule(null);
          setDepartureTime(null);
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
        setSchedule(null);
        setDepartureTime(null);
      }
      setLoading(false);
    }

    fetchSchedule();
  }, [gare, quai]);

  // Removed old clock effect - now using ClockDisplay component

  // Smooth animated vertical scrolling for stations
  useEffect(() => {
    console.log('Starting scroll effect');
    if (!schedule) {
      console.log('No schedule, abort scroll');
      return;
    }

    const stations = getStationsToDisplay();
    console.log('Stations to display:', stations.length);
    if (stations.length <= 9) {
      console.log('Not enough stations to scroll');
      return;
    }

    const stationHeight = 60; // Approximate height per station in pixels
    let currentPosition = 0;
    let animationFrameId;
    let startTime = null;
    const scrollDuration = 2000; // duration of scroll animation in ms
    const pauseDuration = 5000; // pause before scrolling starts and between scrolls

    const stationList = document.querySelector(`.${styles.stationList}`);
    if (!stationList) {
      console.log('Station list element not found');
      return;
    }

    stationList.style.transition = 'none';
    stationList.style.transform = 'translateY(0px)';

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < scrollDuration) {
        const progress = elapsed / scrollDuration;
        const translateY = -progress * stationHeight;
        stationList.style.transform = `translateY(${translateY}px)`;
        animationFrameId = requestAnimationFrame(step);
      } else {
        currentPosition += 1;
        if (currentPosition >= stations.length - 9) {
          currentPosition = 0;
          stationList.style.transition = 'none';
          stationList.style.transform = 'translateY(0px)';
          setTimeout(() => {
            stationList.style.transition = `transform ${scrollDuration}ms ease-in-out`;
            startTime = null;
            animationFrameId = requestAnimationFrame(step);
          }, pauseDuration);
        } else {
          stationList.style.transition = `transform ${scrollDuration}ms ease-in-out`;
          startTime = null;
          animationFrameId = requestAnimationFrame(step);
        }
      }
    };

    const initialPauseTimeout = setTimeout(() => {
      console.log('Starting animation frame');
      stationList.style.transition = `transform ${scrollDuration}ms ease-in-out`;
      animationFrameId = requestAnimationFrame(step);
    }, pauseDuration);

    return () => {
      clearTimeout(initialPauseTimeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stationList) {
        stationList.style.transition = 'none';
        stationList.style.transform = 'translateY(0px)';
      }
    };
  }, [schedule]);

  const formatTimeHHhmm = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}h${minutes}`;
  };

  const getStationsToDisplay = () => {
    if (!schedule || !gare) return [];

    try {
      const servedStations = schedule.servedStations && typeof schedule.servedStations === 'string' 
        ? JSON.parse(schedule.servedStations) 
        : schedule.servedStations || [];

      // Build the full route
      let fullRoute = [schedule.departureStation, ...servedStations];
      
      // Normalize to get names
      let routeNames = fullRoute.map(s => (typeof s === 'object' ? s.name : s));
      
      // Ensure arrival station is the terminus
      const arrivalIndex = routeNames.indexOf(schedule.arrivalStation);
      if (arrivalIndex > -1) {
        fullRoute = fullRoute.slice(0, arrivalIndex + 1);
      } else if (schedule.arrivalStation && schedule.arrivalStation !== schedule.departureStation) {
        fullRoute.push(schedule.arrivalStation);
      }

      // Re-normalize names
      routeNames = fullRoute.map(s => (typeof s === 'object' ? s.name : s));
      
      // Find current station index
      const gareIndex = routeNames.indexOf(gare);
      
      if (gareIndex === -1) return [];

      // Get stations after current station
      const stationsAfterCurrent = fullRoute.slice(gareIndex + 1);
      
      // Filter out the departure station and current station
      const filteredStations = stationsAfterCurrent.filter(station => {
        const stationName = typeof station === 'object' ? station.name : station;
        return stationName !== schedule.departureStation && stationName !== gare;
      });

      // Always ensure arrival station is at the end
      const arrivalStation = schedule.arrivalStation;
      if (arrivalStation) {
        const filteredNames = filteredStations.map(s => typeof s === 'object' ? s.name : s);
        
        if (!filteredNames.includes(arrivalStation)) {
          filteredStations.push(arrivalStation);
        }
      }

      return filteredStations;
    } catch (error) {
      console.error('Error in getStationsToDisplay:', error);
      return [];
    }
  };

  if (!gare || !quai) {
    return (
      <div className={styles.afficheurContainer}>
        <p style={{ color: 'white', fontSize: '2rem' }}>Gare et quai requis.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.afficheurContainer}>
        <p style={{ color: 'white', fontSize: '2rem' }}>Chargement...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className={styles.afficheurContainer}>
        <p style={{ color: 'white', fontSize: '2rem' }}>Aucun départ trouvé pour cette gare et ce quai.</p>
      </div>
    );
  }

  const stationsToDisplay = getStationsToDisplay();
  const visibleStations = stationsToDisplay.slice(scrollPosition, scrollPosition + 9);

  let statusCode = 'on_time';
  if (schedule.isCancelled) {
    statusCode = 'canceled';
  } else if (schedule.delayMinutes && schedule.delayMinutes > 0) {
    statusCode = 'delayed';
  }

  return (
    <div className={styles.afficheurContainer}>
      <div className={styles.leftPanel}>
        <img 
          src={trainTypeLogos[schedule.trainType] || '/sncf-logo.png'} 
          alt={schedule.trainType || 'SNCF'} 
          className={styles.sncfLogo}
          width={100}
          height={50}
        />
        <div className={styles.timeInfo}>
          {formatTimeHHhmm(departureTime)}
        </div>
        <div className={styles.status}>
          {statusCode === 'on_time'
            ? "à l'heure"
            : statusCode === 'delayed'
            ? `Retard ${schedule.delayMinutes}min`
            : 'Supprimé'}
        </div>
        <div className={styles.destination}>
          {schedule.arrivalStation}
        </div>
        <div className={styles.trainInfo}>
          {schedule.trainType} {schedule.trainNumber || schedule.train || schedule.trainId}
        </div>
        
        <div className={styles.departText}>DÉPART</div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.stationContainer}>
          <ul className={styles.stationList}>
            {stationsToDisplay.map((station, index) => {
              const stationName = typeof station === 'object' ? station.name : station;
              const isDestination = stationName === schedule.arrivalStation;
              
              return (
                <li 
                  key={index} 
                  className={`${styles.stationItem} ${isDestination ? styles.highlightedStation : ''}`}
                >
                  {stationName}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ClockDisplay />
    </div>
  );
}
