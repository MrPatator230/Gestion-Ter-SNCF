import pool from '../../../utils/db';

export default async function handler(req, res) {
  const { id } = req.query;

    if (req.method === 'PUT') {
      const body = req.body;
      const fields = [];
      const values = [];

      const fieldMapping = {
        trainNumber: 'train_number',
        departureStation: 'departure_station',
        arrivalStation: 'arrival_station',
        arrivalTime: 'arrival_time',
        departureTime: 'departure_time',
        trainType: 'train_type',
        rollingStockFileName: 'rolling_stock_file_name',
        composition: 'composition',
        joursCirculation: 'jours_circulation',
        servedStations: 'served_stations',
        delayMinutes: 'delay_minutes',
        isCancelled: 'is_cancelled',
        trackAssignments: 'track_assignments',
        cause: 'cause'
      };

      const jsonFields = ['composition', 'joursCirculation', 'servedStations', 'trackAssignments'];
      
      for (const key in body) {
        if (fieldMapping[key] !== undefined) {
          const dbField = fieldMapping[key];
          fields.push(`${dbField} = ?`);
          
          let value = body[key];
          if (jsonFields.includes(key)) {
            value = JSON.stringify(value || (key === 'trackAssignments' ? {} : []));
          }
          values.push(value);
        }
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update.' });
      }

      try {
        // Ensure stations exist if they are being updated
        const stationsToCheck = [];
        if (body.departureStation) {
            stationsToCheck.push(body.departureStation);
        }
        if (body.arrivalStation) {
            stationsToCheck.push(body.arrivalStation);
        }
        if (Array.isArray(body.servedStations)) {
          body.servedStations.forEach(s => {
            if (s && s.name) {
                stationsToCheck.push(s.name);
            }
          });
        }
        
        if (stationsToCheck.length > 0) {
            for (const stationName of stationsToCheck) {
              const [existing] = await pool.query('SELECT id FROM stations WHERE name = ?', [stationName]);
              if (existing.length === 0) {
                await pool.query('INSERT INTO stations (name) VALUES (?)', [stationName]);
              }
            }
        }

        values.push(id);
        const sql = `UPDATE schedules SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;

        await pool.query(sql, values);
        res.status(200).json({ message: 'Schedule updated successfully' });
      } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Failed to update schedule' });
      }
    } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM schedules WHERE id = ?', [id]);
      res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
