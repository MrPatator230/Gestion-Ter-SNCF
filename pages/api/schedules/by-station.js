import pool from '../../../utils/db';

export default async function handler(req, res) {
const { station, gare } = req.query;

const stationParam = station || gare;

if (!stationParam) {
  return res.status(400).json({ error: 'Station or Gare parameter is required' });
}

  let connection;
  try {
    connection = await pool.getConnection();
    // This query is complex because served_stations can be a JSON array of strings or objects.
    // We use LIKE for a simple search. This might match parts of station names,
    // so it's not perfect but works for many cases without complex JSON queries.
    // A better approach would be to normalize the data structure in the DB.
const query = `
  SELECT * FROM schedules 
  WHERE LOWER(departure_station) = LOWER(?) 
  OR LOWER(arrival_station) = LOWER(?) 
  OR LOWER(served_stations) LIKE LOWER(?)
`;
const likePattern = `%"${stationParam}"%`;
const [rows] = await connection.query(query, [stationParam, stationParam, likePattern]);

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
    }));

    res.status(200).json(camelCaseRows);
  } catch (error) {
    console.error(`Error fetching schedules for station ${station}:`, error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    if (connection) connection.release();
  }
}
