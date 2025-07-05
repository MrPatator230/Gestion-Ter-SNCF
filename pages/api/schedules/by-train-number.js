import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { trainNumber } = req.query;
    if (!trainNumber) {
      return res.status(400).json({ error: 'trainNumber query parameter is required' });
    }
    try {
      const [rows] = await pool.query('SELECT * FROM schedules WHERE train_number = ?', [trainNumber]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error fetching schedule by trainNumber:', error);
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
