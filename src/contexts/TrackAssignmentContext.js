import { createContext, useContext, useState, useEffect } from 'react';

const TrackAssignmentContext = createContext();

export function TrackAssignmentProvider({ children }) {
  const [trackAssignments, setTrackAssignments] = useState({});

  useEffect(() => {
    // Load track assignments from API on mount and poll every 10 seconds
    const fetchTrackAssignments = async () => {
      try {
        const response = await fetch('/api/track-assignments');
        if (!response.ok) {
          throw new Error('Failed to fetch track assignments');
        }
        const data = await response.json();
        setTrackAssignments(data);
      } catch (error) {
        console.error('Error fetching track assignments:', error);
        setTrackAssignments({});
      }
    };

    fetchTrackAssignments();
    const intervalId = setInterval(fetchTrackAssignments, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const updateTrackAssignment = (scheduleId, station, track) => {
    setTrackAssignments(prev => {
      const updated = {
        ...prev,
        [scheduleId]: {
          ...(prev[scheduleId] || {}),
          [station]: track
        }
      };
      // Save to localStorage
      localStorage.setItem('trackAssignments', JSON.stringify(updated));
      return updated;
    });
  };

  const removeTrackAssignment = (scheduleId, station) => {
    setTrackAssignments(prev => {
      const updated = { ...prev };
      if (updated[scheduleId]) {
        delete updated[scheduleId][station];
        if (Object.keys(updated[scheduleId]).length === 0) {
          delete updated[scheduleId];
        }
      }
      // Save to localStorage
      localStorage.setItem('trackAssignments', JSON.stringify(updated));
      return updated;
    });
  };

  const clearTrackAssignments = () => {
    setTrackAssignments({});
    localStorage.removeItem('trackAssignments');
  };

  return (
    <TrackAssignmentContext.Provider
      value={{
        trackAssignments,
        updateTrackAssignment,
        removeTrackAssignment,
        clearTrackAssignments
      }}
    >
      {children}
    </TrackAssignmentContext.Provider>
  );
}

export function useTrackAssignments() {
  const context = useContext(TrackAssignmentContext);
  if (context === undefined) {
    throw new Error('useTrackAssignments must be used within a TrackAssignmentProvider');
  }
  return context;
}
