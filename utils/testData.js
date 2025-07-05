export const initTestData = () => {
  // Stations de test
  const stations = [
    { name: 'Dijon' },
    { name: 'Besançon' },
    { name: 'Belfort' },
    { name: 'Montbéliard' },
    { name: 'Dole' },
    { name: 'Seurre' },
    { name: 'Dijon Ville' },
    { name: 'Lons-le-Saunier' },
    { name: 'Vesoul' },
    { name: 'Gray' }
  ];

  // Horaires de test
  const schedules = [
    {
      id: 1,
      trainNumber: 'TER123',
      departureStation: 'Seurre',
      arrivalStation: 'Dijon Ville',
      viaStations: ['Dole'],
      departureTime: '09:00',
      arrivalTime: '10:15',
      trainType: 'TER',
      platform: '2',
      status: 'À l\'heure',
      joursCirculation: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    },
    {
      id: 2,
      trainNumber: 'TER456',
      departureStation: 'Seurre',
      arrivalStation: 'Dijon Ville',
      viaStations: ['Beaune'],
      departureTime: '10:30',
      arrivalTime: '11:45',
      trainType: 'TER',
      platform: '1',
      status: 'Retard 5min',
      joursCirculation: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    },
    {
      id: 3,
      trainNumber: 'TGV789',
      departureStation: 'Dijon Ville',
      arrivalStation: 'Belfort',
      viaStations: ['Besançon', 'Montbéliard'],
      departureTime: '08:00',
      arrivalTime: '09:45',
      trainType: 'TGV',
      platform: '3',
      status: 'À l\'heure',
      joursCirculation: ['lundi', 'mercredi', 'vendredi']
    },
    {
      id: 4,
      trainNumber: 'TER234',
      departureStation: 'Besançon',
      arrivalStation: 'Dijon Ville',
      viaStations: ['Dole'],
      departureTime: '11:00',
      arrivalTime: '12:15',
      trainType: 'TER',
      platform: '4',
      status: 'À l\'heure',
      joursCirculation: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    },
    {
      id: 5,
      trainNumber: 'TER567',
      departureStation: 'Dijon Ville',
      arrivalStation: 'Besançon',
      viaStations: ['Dole', 'Auxonne'],
      departureTime: '14:30',
      arrivalTime: '15:45',
      trainType: 'TER',
      platform: '1',
      status: 'À l\'heure',
      joursCirculation: ['samedi', 'dimanche']
    },
    {
      id: 6,
      trainNumber: 'TGV321',
      departureStation: 'Dijon Ville',
      arrivalStation: 'Paris',
      viaStations: [],
      departureTime: '07:30',
      arrivalTime: '09:00',
      trainType: 'TGV',
      platform: '5',
      status: 'À l\'heure',
      joursCirculation: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    }
  ];

  // Sauvegarder dans localStorage si on est côté client
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('stations')) {
      localStorage.setItem('stations', JSON.stringify(stations));
    }
    if (!localStorage.getItem('schedules')) {
      localStorage.setItem('schedules', JSON.stringify(schedules));
    }
  }
};
