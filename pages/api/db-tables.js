import pool from '../../utils/db';

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
}
