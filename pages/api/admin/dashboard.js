import pool from '../../../utils/db';

export default async function handler(req, res) {
  try {
    // Query to get count of stations
    const [stations] = await pool.query('SELECT COUNT(*) as count FROM stations');
    const stationCount = stations[0]?.count || 0;

    // Query to get count of schedules
    const [schedules] = await pool.query('SELECT COUNT(*) as count FROM schedules');
    const scheduleCount = schedules[0]?.count || 0;

    // Query to calculate on-time ratio (example calculation, adjust as needed)
    // Assuming schedules table has a column 'on_time' boolean or similar
    const [onTimeData] = await pool.query(`
      SELECT 
        ROUND(AVG(CASE WHEN on_time = 1 THEN 100 ELSE 0 END), 0) as onTimeRatio
      FROM schedules
    `);
    const onTimeRatio = onTimeData[0]?.onTimeRatio || 0;

    // Simulate recent activities (replace with real data if available)
    const activities = [
      {
        title: 'Nouvelle annonce créée',
        time: 'Il y a 5 minutes',
        icon: 'campaign',
        color: 'primary',
        description: 'Annonce de retard pour le TER 857412'
      },
      {
        title: 'Horaire modifié',
        time: 'Il y a 15 minutes',
        icon: 'schedule',
        color: 'warning',
        description: 'Modification de l\'horaire du train Paris-Lyon'
      },
      {
        title: 'Nouvelle station ajoutée',
        time: 'Il y a 1 heure',
        icon: 'train',
        color: 'success',
        description: 'Station "Gare de Lyon-Part-Dieu" ajoutée'
      }
    ];

    res.status(200).json({
      stationCount,
      scheduleCount,
      onTimeRatio,
      activities
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
