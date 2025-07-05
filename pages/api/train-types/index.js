import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT DISTINCT type_name FROM train_types ORDER BY type_name ASC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching train types:', error);
      res.status(500).json({ error: 'Failed to fetch train types' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
