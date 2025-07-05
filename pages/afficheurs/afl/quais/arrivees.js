import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './AflQuaiArrivee.module.css';

function formatTimeHHmm(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}

export default function QuaiArrivee() {
  const router = useRouter();
  const { gare, quai } = router.query;

  const [schedule, setSchedule] = useState(null);
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
            if (!s.arrivalTime) return false;
            // Check if trackAssignments for gare matches quai
            if (!s.trackAssignments || !s.trackAssignments[gare]) return false;
            if (s.trackAssignments[gare] !== quai) return false;
            // Check if gare is arrivalStation or in servedStations
            const servedStations = s.servedStations || [];
            const normalizedStations = servedStations.map(station => (typeof station === 'object' ? station.name : station));
            return s.arrivalStation === gare || normalizedStations.includes(gare);
          });

          if (filteredSchedules.length > 0) {
            // Find the schedule with the closest arrival time to now
            const now = new Date();
            let closestSchedule = null;
            let minDiff = Infinity;
            filteredSchedules.forEach(s => {
              const [hours, minutes] = s.arrivalTime.split(':').map(Number);
              const scheduleDate = new Date();
              scheduleDate.setHours(hours, minutes, 0, 0);
              const diff = scheduleDate - now;
              if (diff >= 0 && diff < minDiff) {
                minDiff = diff;
                closestSchedule = s;
              }
            });
            setSchedule(closestSchedule || filteredSchedules[0]);
          } else {
            setSchedule(null);
          }
        } catch (error) {
          console.error(error);
          setSchedule(null);
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
    return <div className={styles.noSchedule}>Aucune arrivée trouvée pour cette gare et ce quai.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <svg className={styles.icon} aria-hidden="true" focusable="false" viewBox="0 0 24 24">
          <path fill="white" d="M12 2L2 7v7c0 3.31 2.69 6 6 6h8c3.31 0 6-2.69 6-6V7l-10-5zM7 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10-2h-4v-2h4v2z"/>
        </svg>
        <h1 className={styles.title}>Prochaine arrivée</h1>
      </header>
      <main className={styles.main}>
        <div className={styles.leftBox}>
          <h2 className={styles.origin}>{schedule.arrivalStation}</h2>
          <p className={styles.trainNumber}>{schedule.trainNumber}</p>
          <p className={styles.arrivalTimeLabel}>Arrivée :</p>
          <p className={styles.arrivalTime}>{formatTimeHHmm(schedule.arrivalTime)}</p>
        </div>
        <div className={styles.rightBox}>
          <ul className={styles.stationList}>
            {schedule.servedStations && schedule.servedStations.length > 0 && schedule.servedStations.map((station, index) => (
              <li
                key={index}
                className={`${styles.stationItem} ${index === 0 || index === schedule.servedStations.length - 1 ? styles.highlightedStation : ''}`}
              >
                {typeof station === 'object' ? station.name : station}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.platformBox}>
          <p className={styles.platformLabel}>Voie</p>
          <p className={styles.platformNumber}>{quai}</p>
        </div>
      </main>
    </div>
  );
}
