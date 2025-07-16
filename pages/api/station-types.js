import pool from '../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT name FROM station_types ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching station types:', error);
    res.status(500).json({ message: 'Error fetching station types' });
  } finally {
    if (connection) connection.release();
  }
}
