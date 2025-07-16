import { useState, useEffect } from 'react';
import styles from './ClockDisplay.module.css';

export default function ClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setShowColon(prev => !prev);
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
    <div className={styles.clockContainer}>
      <div className={styles.timeDisplay}>
        {formatClockTime(currentTime)}
        <span className={styles.seconds}>:{formatClockSeconds(currentTime)}</span>
      </div>
    </div>
  );
}
