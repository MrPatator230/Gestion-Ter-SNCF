import pool from '../../../utils/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { title, startDate, endDate, description, impactType, impactedTrains } = req.body;

    if (!title || !description || !impactType) {
      return res.status(400).json({ error: 'Title, description, and impact type are required' });
    }

    try {
      await pool.query(
        `UPDATE infos_trafic SET title = ?, start_date = ?, end_date = ?, description = ?, impact_type = ?, impacted_trains = ?, updated_at = NOW() WHERE id = ?`,
        [
          title,
          startDate || null,
          endDate || null,
          description,
          impactType,
          JSON.stringify(impactedTrains || []),
          id,
        ]
      );
      res.status(200).json({ message: 'Info trafic updated successfully' });
    } catch (error) {
      console.error('Error updating info trafic:', error);
      res.status(500).json({ error: 'Failed to update info trafic' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM infos_trafic WHERE id = ?', [id]);
      res.status(200).json({ message: 'Info trafic deleted successfully' });
    } catch (error) {
      console.error('Error deleting info trafic:', error);
      res.status(500).json({ error: 'Failed to delete info trafic' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
