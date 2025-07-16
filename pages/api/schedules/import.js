import { IncomingForm } from 'formidable';
import xlsx from 'xlsx';
import pool from '../../../utils/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to convert Excel serial date to HH:mm format
function excelTimeToHHMM(serial) {
  if (typeof serial !== 'number' || serial < 0 || serial >= 1) {
    // If it's not a valid serial, assume it's already a string time
    return serial;
  }
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  
  let total_seconds = Math.floor(86400 * fractional_day);
  
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error parsing the form data.' });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const workbook = xlsx.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // --- Station Creation Logic ---
      const allStationNames = new Set();
      for (const row of data) {
        const departureStation = row.departure_station || row.gare_depart;
        if (departureStation) allStationNames.add(String(departureStation).trim());

        const arrivalStation = row.arrival_station || row.gare_arrivee;
        if (arrivalStation) allStationNames.add(String(arrivalStation).trim());
        
        const servedStationsRaw = row.served_stations || row.gares_desservies;
        if (servedStationsRaw) {
          try {
            const servedStationsArray = JSON.parse(servedStationsRaw);
            if (Array.isArray(servedStationsArray)) {
              servedStationsArray.forEach(station => {
                if (station && station.name) allStationNames.add(String(station.name).trim());
              });
            }
          } catch (e) { // Not a JSON array, so treat as comma-separated string
            String(servedStationsRaw).split(',').forEach(name => {
              if (name && name.trim()) allStationNames.add(name.trim());
            });
          }
        }
      }

      const stationList = Array.from(allStationNames).filter(Boolean);
      if (stationList.length > 0) {
        const placeholders = stationList.map(() => '?').join(',');
        const [existingStationRows] = await connection.execute(`SELECT name FROM stations WHERE name IN (${placeholders})`, stationList);
        const existingStations = new Set(existingStationRows.map(r => r.name));
        const newStations = stationList.filter(name => !existingStations.has(name));

        if (newStations.length > 0) {
          const placeholders = newStations.map(() => '(?, ?)').join(',');
          const stationInsertQuery = `INSERT INTO stations (name, locationType) VALUES ${placeholders}`;
          // Using the default value 'Ville' for new stations
          const stationValues = newStations.flatMap(name => [name, 'Ville']);
          await connection.execute(stationInsertQuery, stationValues);
        }
      }
      // --- End Station Creation ---

      let createdCount = 0;
      let updatedCount = 0;

      for (const row of data) {
        const train_number = row.train_number || row.numero_train;
        
        if (!train_number) {
          continue; // Skip rows without a train number
        }

        // Handle both snake_case and French headers
        const scheduleData = {
          train_number: String(train_number),
          departure_station: row.departure_station || row.gare_depart,
          arrival_station: row.arrival_station || row.gare_arrivee,
          arrival_time: excelTimeToHHMM(row.arrival_time || row.heure_arrivee),
          departure_time: excelTimeToHHMM(row.departure_time || row.heure_depart),
          train_type: row.train_type || row.type_train,
          served_stations: row.served_stations || row.gares_desservies,
          jours_circulation: row.jours_circulation || row.jours_circulation,
        };
        
        const joursCirculationArray = scheduleData.jours_circulation ? String(scheduleData.jours_circulation).split(',').map(s => s.trim()) : [];
        
        let servedStationsArray = [];
        if (scheduleData.served_stations) {
          try {
            // Attempt to parse if it's a JSON string
            servedStationsArray = JSON.parse(scheduleData.served_stations);
          } catch (e) {
            // If not JSON, assume it's a simple comma-separated string of names
            servedStationsArray = String(scheduleData.served_stations).split(',').map(name => ({
              name: name.trim(),
              arrivalTime: '',
              departureTime: ''
            }));
          }
        }

        const [rows] = await connection.execute('SELECT * FROM schedules WHERE train_number = ?', [scheduleData.train_number]);
        const existingSchedule = rows[0];

        if (existingSchedule) {
          const updateQuery = `
            UPDATE schedules SET
              departure_station = COALESCE(?, departure_station),
              arrival_station = COALESCE(?, arrival_station),
              arrival_time = COALESCE(?, arrival_time),
              departure_time = COALESCE(?, departure_time),
              train_type = COALESCE(?, train_type),
              served_stations = COALESCE(?, served_stations),
              jours_circulation = COALESCE(?, jours_circulation),
              updated_at = ?
            WHERE train_number = ?
          `;
          await connection.execute(updateQuery, [
            scheduleData.departure_station,
            scheduleData.arrival_station,
            scheduleData.arrival_time,
            scheduleData.departure_time,
            scheduleData.train_type,
            JSON.stringify(servedStationsArray),
            JSON.stringify(joursCirculationArray),
            new Date(),
            scheduleData.train_number
          ]);
          updatedCount++;
        } else {
          // Create new schedule
          const insertQuery = `
            INSERT INTO schedules (
              train_number, departure_station, arrival_station, arrival_time, departure_time,
              train_type, served_stations, jours_circulation, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          await connection.execute(insertQuery, [
            scheduleData.train_number,
            scheduleData.departure_station,
            scheduleData.arrival_station,
            scheduleData.arrival_time,
            scheduleData.departure_time,
            scheduleData.train_type,
            JSON.stringify(servedStationsArray),
            JSON.stringify(joursCirculationArray),
            new Date(),
            new Date()
          ]);
          createdCount++;
        }
      }

      await connection.commit();
      res.status(200).json({ created: createdCount, updated: updatedCount });

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error processing Excel file:', error);
      res.status(500).json({ message: 'Error processing Excel file: ' + error.message });
    } finally {
      if (connection) connection.release();
    }
  });
}
