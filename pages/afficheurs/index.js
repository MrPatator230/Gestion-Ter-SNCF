
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AfficheursRedirect() {
  const router = useRouter();
  const { type, gare } = router.query;

  useEffect(() => {
    if (type && gare) {
      if (type === 'departures') {
        router.replace(`/afficheurs/departs?gare=${encodeURIComponent(gare)}`);
      } else if (type === 'arrivals') {
        router.replace(`/afficheurs/arrivees?gare=${encodeURIComponent(gare)}`);
      }
    }
  }, [type, gare, router]);

  return null;
}

function ScheduleRow({ schedule, status, trainType, logoSrc, isEven, type, displayTime, gare, delayMinutes, displayIndex, trackAssignments }) {
  const statusCode = status.status;

  const getDelayedTime = () => {
    if (!delayMinutes || delayMinutes <= 0) return null;
    const [hours, minutes] = displayTime.split(':').map(Number);
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + delayMinutes);
    const delayedHours = date.getHours().toString().padStart(2, '0');
    const delayedMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${delayedHours}:${delayedMinutes}`;
  };

  const delayedTime = getDelayedTime();

  const now = new Date();
  const [hours, minutes] = displayTime.split(':').map(Number);
  const scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  const diffMinutes = (scheduleDate - now) / 60000;
  if (diffMinutes < 2 && diffMinutes >= 0) {
    return null;
  }

  const renderStatusContent = () => {
    if (statusCode === 'ontime') {
      if (displayIndex === 0) {
        return (
          <div className={type === 'arrivals' ? arrivalsStyles.statusTextArrivals : styles.trainTypeNameContainer}>
            <div>{trainType}</div>
            <div>{schedule.trainNumber || ''}</div>
          </div>
        );
      } else {
        return <div className={type === 'arrivals' ? arrivalsStyles.statusTextArrivals : styles.statusText}>à l&apos;heure</div>;
      }
    } else if (statusCode === 'delayed') {
      if (displayIndex === 0) {
        return (
          <div className={type === 'arrivals' ? arrivalsStyles.statusTextArrivals : styles.trainTypeNameContainer}>
            <div className={styles.yellowText}>{trainType}</div>
            <div className={styles.yellowText}>{schedule.trainNumber || ''}</div>
          </div>
        );
      } else {
        return (
          <div className={styles.statusDelayedDistinct}>
            <div>Retard</div>
            <div className={styles.delayDuration}>{delayMinutes} min</div>
          </div>
        );
      }
    } else if (statusCode === 'cancelled') {
      if (displayIndex === 0) {
        return (
          <div className={type === 'arrivals' ? arrivalsStyles.statusTextArrivals : styles.trainTypeNameContainer}>
            <div className={styles.yellowText}>{trainType}</div>
            <div className={styles.yellowText}>{schedule.trainNumber || ''}</div>
          </div>
        );
      } else {
        return <div className={styles.statusSupprimeDistinct}>supprimé</div>;
      }
    } else {
      return (
        <div className={type === 'arrivals' ? arrivalsStyles.statusTextArrivals : styles.trainTypeNameContainer}>
          <div>{trainType}</div>
          <div>{schedule.trainNumber || ''}</div>
        </div>
      );
    }
  };

  return (
    <li className={`${type === 'arrivals' ? arrivalsStyles.scheduleRow : styles.scheduleRow} ${isEven ? (type === 'arrivals' ? arrivalsStyles.scheduleRowEven : styles.scheduleRowEven) : (type === 'arrivals' ? arrivalsStyles.scheduleRowOdd : styles.scheduleRowOdd)}`} role="listitem">
      <section className={type === 'arrivals' ? arrivalsStyles.leftSection : styles.leftSection}>
        <div className={type === 'arrivals' ? arrivalsStyles.logoContainer : styles.logoContainer}>
          <Image src={logoSrc} alt={trainType} layout="fill" objectFit="contain" />
        </div>
        <div className={type === 'arrivals' ? arrivalsStyles.statusText : styles.statusText}>
          {renderStatusContent()}
        </div>
      </section>
      <time className={type === 'arrivals' ? arrivalsStyles.departureTime : styles.departureTime} dateTime={displayTime} style={{ display: statusCode === 'cancelled' ? 'none' : 'block', color: '#ffea00' }}>
        {statusCode === 'delayed' && displayIndex === 0 ? displayTime : (statusCode === 'delayed' && displayIndex === 1 ? delayedTime : displayTime)}
      </time>
      <section className={type === 'arrivals' ? arrivalsStyles.middleSection : styles.middleSection}>
        <div className={type === 'arrivals' ? arrivalsStyles.destination : styles.destination}>
          {type === 'departures' ? schedule.arrivalStation : schedule.departureStation}
        </div>
        {schedule.servedStations && schedule.servedStations.length > 0 && (
          <div className={type === 'arrivals' ? arrivalsStyles.viaContainer : styles.viaContainer}>
            <span className={type === 'arrivals' ? arrivalsStyles.viaText : styles.viaText}>Via</span>
            <div className={`${type === 'arrivals' ? arrivalsStyles.marquee : styles.marquee} ${(function() {
              const now = new Date();
              const [hours, minutes] = displayTime.split(':').map(Number);
              const scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
              const diffMinutes = (scheduleDate - now) / 60000;
              const showPlatform = diffMinutes <= 30 && diffMinutes >= 0;
              return showPlatform ? (type === 'arrivals' ? arrivalsStyles.limitedWidth : styles.limitedWidth) : '';
            })()}`}>
              <div className={type === 'arrivals' ? arrivalsStyles.marqueeContent : styles.marqueeContent}>
                {(() => {
                  const selectedStation = gare;
                  let stationsList = [];
                  if (schedule.servedStations && schedule.servedStations.length > 0) {
                    const normalizedStations = schedule.servedStations.map(station => typeof station === 'object' ? station.name : station);
                    const startIndex = normalizedStations.indexOf(selectedStation);
                    if (startIndex !== -1) {
                      stationsList = type === 'arrivals' ? normalizedStations.slice(0, startIndex) : normalizedStations.slice(startIndex);
                    } else {
                      stationsList = normalizedStations;
                    }
                  }
                  return stationsList.map((station, idx) => (
                    <span key={idx} className={type === 'arrivals' ? arrivalsStyles.marqueeStation : styles.marqueeStation}>
                      {station}{idx < stationsList.length - 1 ? <span className={type === 'arrivals' ? arrivalsStyles.marqueeSeparator : styles.marqueeSeparator}>•</span> : ''}
                    </span>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </section>
      {(() => {
        const now = new Date();
        const [hours, minutes] = displayTime.split(':').map(Number);
        const scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        const diffMinutes = (scheduleDate - now) / 60000;
        const showPlatform = diffMinutes <= 30 && diffMinutes >= 0;
        return (
          <div
            className={`${type === 'arrivals' ? arrivalsStyles.rightSection : styles.rightSection} ${!showPlatform ? (type === 'arrivals' ? arrivalsStyles.hiddenSquare : styles.hiddenSquare) : ''}`}
            aria-hidden={!showPlatform}
          >
            {showPlatform ? (trackAssignments[schedule.id]?.[gare] || schedule.track || '-') : ''}
          </div>
        );
      })()}
    </li>
  );
}
