import pool from '../../../utils/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    try {
      await pool.query(
        'UPDATE schedule_folders SET name = ?, updated_at = NOW() WHERE id = ?',
        [name, id]
      );
      res.status(200).json({ message: 'Schedule folder updated successfully' });
    } catch (error) {
      console.error('Error updating schedule folder:', error);
      res.status(500).json({ error: 'Failed to update schedule folder' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM schedule_folders WHERE id = ?', [id]);
      res.status(200).json({ message: 'Schedule folder deleted successfully' });
    } catch (error) {
      console.error('Error deleting schedule folder:', error);
      res.status(500).json({ error: 'Failed to delete schedule folder' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
