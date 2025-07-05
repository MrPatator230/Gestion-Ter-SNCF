import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM schedules ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  } else if (req.method === 'POST') {
    const {
      trainNumber,
      departureStation,
      arrivalStation,
      arrivalTime,
      departureTime,
      trainType,
      rollingStockFileName,
      composition,
      joursCirculation,
      servedStations,
    } = req.body;

    if (!trainNumber || !departureStation || !arrivalStation || !arrivalTime || !departureTime || !trainType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Ensure stations exist
      const stationsToCheck = [departureStation, arrivalStation];
      if (Array.isArray(servedStations)) {
        servedStations.forEach(s => {
          if (s.name) stationsToCheck.push(s.name);
        });
      }
      for (const stationName of stationsToCheck) {
        const [existing] = await pool.query('SELECT id FROM stations WHERE name = ?', [stationName]);
        if (existing.length === 0) {
          await pool.query('INSERT INTO stations (name) VALUES (?)', [stationName]);
        }
      }

      const [result] = await pool.query(
        `INSERT INTO schedules 
          (train_number, departure_station, arrival_station, arrival_time, departure_time, train_type, rolling_stock_file_name, composition, jours_circulation, served_stations) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trainNumber,
          departureStation,
          arrivalStation,
          arrivalTime,
          departureTime,
          trainType,
          rollingStockFileName || null,
          JSON.stringify(composition || []),
          JSON.stringify(joursCirculation || []),
          JSON.stringify(servedStations || []),
        ]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error('Error creating schedule:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
