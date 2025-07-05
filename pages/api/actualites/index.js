import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM actualites ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching actualites:', error);
      res.status(500).json({ error: 'Failed to fetch actualites' });
    }
  } else if (req.method === 'POST') {
    const { title, date, scheduled, content, icon, attachments } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO actualites (title, date, scheduled, content, icon, attachments) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          date || null,
          scheduled || false,
          content,
          icon || null,
          JSON.stringify(attachments || []),
        ]
      );
      const newActualite = { id: result.insertId, title, date, scheduled, content, icon, attachments };
      res.status(201).json(newActualite);
    } catch (error) {
      console.error('Error creating actualite:', error);
      res.status(500).json({ error: 'Failed to create actualite' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
