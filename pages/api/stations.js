import pool from '../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id, name, distinct } = req.query;

    if (distinct === 'true') {
      // Return distinct station names ordered alphabetically
      try {
        const query = 'SELECT DISTINCT name FROM stations ORDER BY name ASC';
        const [rows] = await pool.query(query);
        return res.status(200).json(rows);
      } catch (error) {
        console.error('Error fetching distinct station names:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    let connection;
    try {
      connection = await pool.getConnection();
      if (id) {
        // Fetch single station by id with categories
        const [stations] = await connection.query('SELECT * FROM stations WHERE id = ?', [id]);
        if (stations.length === 0) {
          return res.status(404).json({ error: 'Station not found' });
        }
        const station = stations[0];
        const [categories] = await connection.query('SELECT category FROM station_categories WHERE station_id = ?', [id]);
        const categoriesList = categories.map(cat => cat.category);
        const stationWithCategories = {
          id: station.id,
          name: station.name,
          locationType: station.locationType || 'Ville',
          categories: categoriesList,
          message: station.message || null
        };
        return res.status(200).json(stationWithCategories);
      } else if (name) {
        // Fetch single station by name with categories
        const [stations] = await connection.query('SELECT * FROM stations WHERE name = ?', [name]);
        if (stations.length === 0) {
          return res.status(404).json({ error: 'Station not found' });
        }
        const station = stations[0];
        const [categories] = await connection.query('SELECT category FROM station_categories WHERE station_id = ?', [station.id]);
        const categoriesList = categories.map(cat => cat.category);
        const stationWithCategories = {
          id: station.id,
          name: station.name,
          locationType: station.locationType || 'Ville',
          categories: categoriesList,
          message: station.message || null
        };
        return res.status(200).json(stationWithCategories);
      } else {
        // Fetch all stations
        const [stations] = await connection.query('SELECT * FROM stations ORDER BY id ASC');
        const [categories] = await connection.query('SELECT * FROM station_categories');

        // Map categories to stations
        const stationCategoriesMap = {};
        categories.forEach(cat => {
          if (!stationCategoriesMap[cat.station_id]) {
            stationCategoriesMap[cat.station_id] = [];
          }
          stationCategoriesMap[cat.station_id].push(cat.category);
        });

        const stationsWithCategories = stations.map(station => ({
          id: station.id,
          name: station.name,
          locationType: station.locationType || 'Ville',
          categories: stationCategoriesMap[station.id] || []
        }));

        res.status(200).json(stationsWithCategories);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      res.status(500).json({ error: 'Failed to fetch stations' });
    } finally {
      if (connection) connection.release();
    }
  } else if (req.method === 'POST') {
    const stations = req.body;
    if (!Array.isArray(stations)) {
      return res.status(400).json({ error: 'Invalid stations data' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Clear existing stations and categories
      await connection.query('DELETE FROM station_categories');
      await connection.query('DELETE FROM stations');

      // Insert new stations and categories
      for (const station of stations) {
        const [result] = await connection.query('INSERT INTO stations (name, locationType) VALUES (?, ?)', [station.name, station.locationType || 'Ville']);
        const stationId = result.insertId;
        if (Array.isArray(station.categories)) {
          for (const category of station.categories) {
            await connection.query('INSERT INTO station_categories (station_id, category) VALUES (?, ?)', [stationId, category]);
          }
        }
      }

      await connection.commit();
      res.status(200).json({ message: 'Stations saved successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error saving stations:', error);
      res.status(500).json({ error: 'Failed to save stations' });
    } finally {
      connection.release();
    }
  } else if (req.method === 'PATCH') {
    const { id, message } = req.body;
    if (!id || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    let connection;
    try {
      connection = await pool.getConnection();
      const [result] = await connection.query('UPDATE stations SET message = ? WHERE id = ?', [message, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Station not found' });
      }
      res.status(200).json({ message: 'Station message updated successfully' });
    } catch (error) {
      console.error('Error updating station message:', error);
      res.status(500).json({ error: 'Failed to update station message' });
    } finally {
      if (connection) connection.release();
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
