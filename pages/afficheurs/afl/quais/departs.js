import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './AflQuaiDepart.module.css';
import connectorStyles from './StationListConnector.module.css';

function formatTimeHHmm(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}

export default function QuaiDepart() {
  const router = useRouter();
  const { gare, quai } = router.query;

  const [schedule, setSchedule] = useState(null);
  const [departureTime, setDepartureTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      if (gare && quai) {
        setLoading(true);
        try {
          const res = await fetch(`/api/schedules/by-station?station=${gare}`);
          if (!res.ok) {
            throw new Error('Failed to fetch schedules');
          }
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
              if (schedule.departureStation === gareName) {
                return schedule.departureTime;
              }
              if (schedule.servedStations) {
                const served = typeof schedule.servedStations === 'string' ? JSON.parse(schedule.servedStations) : schedule.servedStations;
                const stationInfo = served.find(s => (typeof s === 'object' ? s.name : s) === gareName);
                if (stationInfo && typeof stationInfo === 'object' && (stationInfo.time || stationInfo.departureTime)) {
                  return stationInfo.time || stationInfo.departureTime;
                }
              }
              return null;
            };

            const now = new Date();
            const upcoming = filteredSchedules
              .map(s => {
                const time = getDepartureTimeForGare(s, gare);
                if (!time) return null;
                const [hours, minutes] = time.split(':');
                const departureDate = new Date();
                departureDate.setHours(hours, minutes, 0, 0);
                if (departureDate < now) return null;
                return { schedule: s, departureTime: time, date: departureDate };
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
          console.error(error);
          setSchedule(null);
          setDepartureTime(null);
        }
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [gare, quai]);

  if (!gare || !quai) {
    return <div className={styles.error}>Paramètres gare et quai requis.</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (!schedule) {
    return <div className={styles.noSchedule}>Aucun départ trouvé pour cette gare et ce quai.</div>;
  }

  // Helper to get served stations list from schedule
  const servedStations = schedule.servedStations && typeof schedule.servedStations === 'string' ? JSON.parse(schedule.servedStations) : schedule.servedStations || [];

  let statusCode = 'on_time';
  if (schedule.isCancelled) {
    statusCode = 'canceled';
  } else if (schedule.delayMinutes && schedule.delayMinutes > 0) {
    statusCode = 'delayed';
  }


  return (
    <>
    <header className={styles.header} style={{ backgroundColor: '#0057b8', display: 'flex', alignItems: 'center', padding: '10px 30px', fontWeight: '900', fontSize: '3rem', gap: '15px' }}>
        <svg viewBox="0 0 368 500" className={styles.headerIcon} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" style={{ height: '3rem' }}>
          <path d="M25.2 495.2L49.6 468h269l24.4 27.2c5.7 6.4 15.1 6.4 20.8 0 5.7-6.4 5.7-16.8 0-23.1l-70.7-78.7c1.6-1.1 3.2-2.3 4.3-3.4 13.1-10.6 25.3-26.9 34.2-52.1 12.4-35.4 21.2-67 23.7-105.9 3.3-48-16.4-122.5-29.4-157.2l-4.6-12.3c-2.8-7.8-13.5-24.4-32.5-44.2C272.3 1.2 256.6 0 232.7 0h-97.2c-23.9 0-39.6 1.2-56 18.3-19 19.8-29.7 36.4-32.6 44.2l-4.6 12.3C29.3 109.5 9.6 184 12.9 232c2.4 38.8 11.2 70.3 23.7 105.8 8.9 25.3 21.1 41.6 34.2 52.1 1.2 1.1 2.7 2.2 4.4 3.3L4.4 472c-5.8 6.4-5.8 16.8 0 23.1 5.8 6.5 15.1 6.5 20.8.1zM79 435.3l26.1-29c12.7 2.9 24.4 2.9 32.9 2.9h92.1c8.5 0 20.2 0 32.9-2.9l26.1 29H79zm190.3-70.7c-13.4 0-24.3-10.9-24.3-24.3s10.9-24.3 24.3-24.3 24.3 10.9 24.3 24.3-10.9 24.3-24.3 24.3zm-220-155.9c-14.9 0 8.5-130.5 19.1-130.5h228.7c11.6 0 38.7 130.5 20.5 130.5H49.3zm24.8 131.6c0-13.4 10.9-24.3 24.3-24.3s24.3 10.9 24.3 24.3-10.9 24.3-24.3 24.3-24.3-10.9-24.3-24.3z" fill="#ffffff"/>
        </svg>
        <h1 className={styles.headerTitle} >Prochain départ : </h1>
          <p className={styles.headerTime}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

      </header>
    <div className={styles.container}>
      
      <main className={styles.main}>
        <div className={styles.leftBox}>
          <div className={styles.destinationWrapper} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className={styles.destination}>{schedule.arrivalStation}</h1>
            <div className={styles.statusBadge} style={{ backgroundColor: (() => {
              if (statusCode === 'on_time') return '#007bff'; // blue
              if (statusCode === 'delayed') return '#ff7f50'; // coral for delayed
              if (statusCode === 'canceled') return '#cf0a0a'; // canceled Red
              return '#0057b8';
            })() }}>
              {statusCode === 'on_time' && (
                <>
                  <svg viewBox="0 0 500 500" style={{ height: '1.8rem', width: '2rem', marginRight: '1rem', display: 'block', marginTop: 'auto', marginBottom: 'auto' }} aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="250" cy="250" r="260" fill="#ffffff" />
                    <path d="M493.0162,131.3881,167.6317,431.1571c-8.14,7.3934-21.2841,7.3934-29.0509,0L6.9931,310.1741a17.9886,17.9886,0,0,1,0-26.81l38.7594-35.8468c8.29-7.1694,21.2094-7.1694,28.9762,0l63.7774,58.3257c7.7669,7.4681,20.9107,7.4681,29.0509,0l257.5-237.1117a22.0339,22.0339,0,0,1,28.9762,0l38.9087,35.7721a18.0157,18.0157,0,0,1,.0747,26.8851Z" 
                    fill="#007bff" />
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
                  <span>+ {schedule.delayMinutes} min</span>
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
          </div>
          <p className={styles.departureTime} style={{ color: '#dfff00', fontWeight: '900', fontSize: '3rem' }}>
            {formatTimeHHmm(departureTime)}
          </p>
          <p className={styles.trainType}>{schedule.trainType} | {schedule.trainNumber}</p>
        </div>
        <div className={styles.rightBox}>
          <div className={connectorStyles.stationListContainer}>
            <div className={connectorStyles.connectorLine}></div>
            <ul className={styles.stationList}>
              {(() => {
                if (!schedule) return null;

                // Build the full route with original objects/strings
                let fullRoute = [
                  schedule.departureStation,
                  ...servedStations,
                ];
                
                // Normalize to get names for checks
                let routeNames = fullRoute.map(s => (typeof s === 'object' ? s.name : s));
                
                // Ensure arrival station is the terminus
                const arrivalIndex = routeNames.indexOf(schedule.arrivalStation);
                if (arrivalIndex > -1) {
                  // If arrival station is in the list, truncate after it.
                  fullRoute = fullRoute.slice(0, arrivalIndex + 1);
                } else {
                  // If not in the list, add it to the end.
                  fullRoute.push(schedule.arrivalStation);
                }

                // Re-normalize names after potential changes
                routeNames = fullRoute.map(s => (typeof s === 'object' ? s.name : s));
                
                // Find where the current station is in the route
                const gareIndex = routeNames.indexOf(gare);

                // If the station is not on the route, don't display anything.
                if (gareIndex === -1) {
                  return null;
                }

                // Display stations from the current one to the terminus.
                const stationsToDisplay = fullRoute.slice(gareIndex);

                return stationsToDisplay.map((station, index) => {
                  const classes = [styles.stationItem];
                  if (index === 0 || index === stationsToDisplay.length - 1) {
                    classes.push(styles.highlightedStation);
                  }

                  return (
                    <li
                      key={index}
                      className={classes.join(' ')}
                    >
                      {index === 0 && (
                        <svg viewBox="0 40 750 750" className={styles.currentStationIcon}>
                          <path d="M250.8823,404.0725,12.3539,169.3287c-15.1383-15.1384-15.1383-42.4272,0-61.35,15.1384-15.1383,46.2118-15.1383,61.35,0L250.8823,281.3723l172.597-174.0909c18.9229-15.1383,46.2118-15.1383,61.35,0l7.5692,7.5692c11.3537,18.9229,7.5691,42.4272-7.5692,57.5655L250.8823,404.0726Z" fill="#0088ce"/>
                        </svg>
                      )}
                      {typeof station === 'object' ? station.name : station}
                    </li>
                  );
                });
              })()}
            </ul>
          </div>
        </div>
        
        <div className={styles.platformBox}>
          <p className={styles.platformLabel}>Voie</p>
          <p className={styles.platformNumber}>{quai}</p>
        </div>
      </main>
    </div>
          
      </>
  );
}
