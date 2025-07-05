import pool from '../../../utils/db';

export default async function handler(req, res) {
  const { station, quai } = req.query;

  if (!station || !quai) {
    return res.status(400).json({ error: 'Station and quai parameters are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    // Query schedules filtered by departure station and track (quai)
    const query = `
      SELECT * FROM schedules 
      WHERE departure_station = ?
      AND (track = ? OR track_assignments LIKE ?)
      AND served_stations LIKE ?
      AND departure_time >= NOW()
      ORDER BY departure_time ASC
      
    `;
    const likePattern = `%"${station}"%`;
    const likeQuaiPattern = `%"${quai}"%`;
    const [rows] = await connection.query(query, [station, quai, likeQuaiPattern, likePattern]);

    // Transform keys from snake_case to camelCase
    const camelCaseRows = rows.map(row => ({
      id: row.id,
      trainNumber: row.train_number,
      departureStation: row.departure_station,
      arrivalStation: row.arrival_station,
      arrivalTime: row.arrival_time,
      departureTime: row.departure_time,
      trainType: row.train_type,
      rollingStockFileName: row.rolling_stock_file_name,
      composition: row.composition,
      joursCirculation: row.jours_circulation,
      servedStations: row.served_stations,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      delayMinutes: row.delay_minutes,
      isCancelled: row.is_cancelled,
      trackAssignments: row.track_assignments,
      cause: row.cause,
      statusCode: row.status_code,
      statusMessage: row.status_message,
      statusUpdatedAt: row.status_updated_at,
      isRealTime: row.is_real_time,
      isDeleted: row.is_deleted,
      isVisible: row.is_visible,
      isDisplayed: row.is_displayed,
      isArchived: row.is_archived,
      isInService: row.is_in_service,
      track: row.track,
    }));

    res.status(200).json(camelCaseRows);
  } catch (error) {
    console.error(`Error fetching departure schedules for station ${station} and quai ${quai}:`, error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    if (connection) connection.release();
  }
}
