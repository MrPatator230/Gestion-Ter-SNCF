import { useState, useEffect } from 'react';

export function useTrackAssignments() {
  const [trackAssignments, setTrackAssignments] = useState({});

  useEffect(() => {
    // Charger les attributions de quais depuis le localStorage
    const savedTrackAssignments = localStorage.getItem('trackAssignments');
    if (savedTrackAssignments) {
      try {
        setTrackAssignments(JSON.parse(savedTrackAssignments));
      } catch (error) {
        console.error('Erreur lors du chargement des attributions de quais:', error);
      }
    }

    // Écouter les changements dans le localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'trackAssignments') {
        try {
          const newAssignments = JSON.parse(e.newValue);
          setTrackAssignments(newAssignments);
        } catch (error) {
          console.error('Erreur lors de la mise à jour des attributions de quais:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateTrackAssignment = (scheduleId, stationName, track) => {
    const newAssignments = {
      ...trackAssignments,
      [scheduleId]: {
        ...(trackAssignments[scheduleId] || {}),
        [stationName]: track
      }
    };
    setTrackAssignments(newAssignments);
    localStorage.setItem('trackAssignments', JSON.stringify(newAssignments));
  };

  return { trackAssignments, updateTrackAssignment };
}
