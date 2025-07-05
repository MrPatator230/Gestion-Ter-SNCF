import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM infos_trafic ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching infos trafic:', error);
      res.status(500).json({ error: 'Failed to fetch infos trafic' });
    }
  } else if (req.method === 'POST') {
    const { title, startDate, endDate, description, impactType, impactedTrains } = req.body;

    if (!title || !description || !impactType) {
      return res.status(400).json({ error: 'Title, description, and impact type are required' });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO infos_trafic (title, start_date, end_date, description, impact_type, impacted_trains) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          startDate || null,
          endDate || null,
          description,
          impactType,
          JSON.stringify(impactedTrains || []),
        ]
      );
      const newInfo = { id: result.insertId, title, startDate, endDate, description, impactType, impactedTrains };
      res.status(201).json(newInfo);
    } catch (error) {
      console.error('Error creating info trafic:', error);
      res.status(500).json({ error: 'Failed to create info trafic' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
