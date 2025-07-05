import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM schedule_folders ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching schedule folders:', error);
      res.status(500).json({ error: 'Failed to fetch schedule folders' });
    }
  } else if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    try {
      const [result] = await pool.query(
        'INSERT INTO schedule_folders (name) VALUES (?)',
        [name]
      );
      res.status(201).json({ id: result.insertId, name });
    } catch (error) {
      console.error('Error creating schedule folder:', error);
      res.status(500).json({ error: 'Failed to create schedule folder' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
