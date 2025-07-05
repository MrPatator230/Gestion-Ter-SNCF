import pool from '../../../utils/db';

export default async function handler(req, res) {
  try {
    const query = 'SELECT DISTINCT name FROM stations ORDER BY name ASC';
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
