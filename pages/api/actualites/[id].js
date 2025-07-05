import pool from '../../../utils/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { title, date, scheduled, content, icon, attachments } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
      await pool.query(
        `UPDATE actualites SET title = ?, date = ?, scheduled = ?, content = ?, icon = ?, attachments = ?, updated_at = NOW() WHERE id = ?`,
        [
          title,
          date || null,
          scheduled || false,
          content,
          icon || null,
          JSON.stringify(attachments || []),
          id,
        ]
      );
      res.status(200).json({ message: 'Actualite updated successfully' });
    } catch (error) {
      console.error('Error updating actualite:', error);
      res.status(500).json({ error: 'Failed to update actualite' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM actualites WHERE id = ?', [id]);
      res.status(200).json({ message: 'Actualite deleted successfully' });
    } catch (error) {
      console.error('Error deleting actualite:', error);
      res.status(500).json({ error: 'Failed to delete actualite' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
