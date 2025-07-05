// Fonction pour extraire toutes les gares uniques d'un horaire
export const extractStationsFromSchedule = (schedule) => {
  const stations = new Set();
  stations.add(schedule.departureStation);
  stations.add(schedule.arrivalStation);
  if (schedule.viaStations && Array.isArray(schedule.viaStations)) {
    schedule.viaStations.forEach(station => stations.add(station));
  }
  return Array.from(stations);
};

// Fonction pour mettre à jour la liste des gares dans localStorage
export const updateStationsFromSchedule = (schedule) => {
  if (typeof window === 'undefined') return;

  // Récupérer les gares existantes
  const existingStations = JSON.parse(localStorage.getItem('stations') || '[]');
  const existingStationNames = new Set(existingStations.map(s => s.name));

  // Extraire les gares de l'horaire
  const scheduleStations = extractStationsFromSchedule(schedule);

  // Ajouter les nouvelles gares
  let hasNewStations = false;
  scheduleStations.forEach(stationName => {
    if (!existingStationNames.has(stationName)) {
      existingStations.push({
        name: stationName,
        createdAt: new Date().toISOString()
      });
      hasNewStations = true;
    }
  });

  // Sauvegarder si de nouvelles gares ont été ajoutées
  if (hasNewStations) {
    localStorage.setItem('stations', JSON.stringify(existingStations));
  }
};

// Fonction pour mettre à jour la liste des gares à partir de plusieurs horaires
export const updateStationsFromSchedules = (schedules) => {
  if (!Array.isArray(schedules)) return;
  schedules.forEach(schedule => updateStationsFromSchedule(schedule));
};

// Fonction pour ajouter une nouvelle gare
export const addStation = (stationName) => {
  if (typeof window === 'undefined' || !stationName) return false;

  const existingStations = JSON.parse(localStorage.getItem('stations') || '[]');
  if (!existingStations.some(s => s.name === stationName)) {
    existingStations.push({
      name: stationName,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('stations', JSON.stringify(existingStations));
    return true;
  }
  return false;
};

// Fonction pour récupérer toutes les gares
export const getAllStations = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('stations') || '[]');
};

// Fonction pour vérifier si une gare existe
export const stationExists = (stationName) => {
  if (typeof window === 'undefined' || !stationName) return false;
  const stations = getAllStations();
  return stations.some(s => s.name === stationName);
};
