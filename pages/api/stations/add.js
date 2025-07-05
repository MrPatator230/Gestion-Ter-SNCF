import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Station name is required' });
    }
    try {
      // Check if station already exists
      const [existing] = await pool.query('SELECT id FROM stations WHERE name = ?', [name]);
      if (existing.length > 0) {
        return res.status(200).json({ id: existing[0].id, name });
      }
      // Insert new station
      const [result] = await pool.query('INSERT INTO stations (name) VALUES (?)', [name]);
      res.status(201).json({ id: result.insertId, name });
    } catch (error) {
      console.error('Error adding station:', error);
      res.status(500).json({ error: 'Failed to add station' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
