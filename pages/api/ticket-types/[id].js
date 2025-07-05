import pool from '../../../utils/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    try {
      await pool.query(
        'UPDATE ticket_types SET name = ?, price = ?, category = ?, updated_at = NOW() WHERE id = ?',
        [name, price, category, id]
      );
      res.status(200).json({ message: 'Ticket type updated successfully' });
    } catch (error) {
      console.error('Error updating ticket type:', error);
      res.status(500).json({ error: 'Failed to update ticket type' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM ticket_types WHERE id = ?', [id]);
      res.status(200).json({ message: 'Ticket type deleted successfully' });
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      res.status(500).json({ error: 'Failed to delete ticket type' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
