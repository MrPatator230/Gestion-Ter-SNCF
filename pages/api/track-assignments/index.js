import pool from '../../../utils/db';

export default async function handler(req, res) {
  console.log('Track assignments API called with method:', req.method);
  if (req.method === 'GET') {
    try {
      // Query schedules table for id and track_assignments JSON column
      const query = 'SELECT id, track_assignments FROM schedules';
      const [rows] = await pool.query(query);
      console.log('Schedules rows with track_assignments:', rows);

      // Transform into nested object { scheduleId: { station: track, ... }, ... }
      const trackAssignments = {};
      rows.forEach(row => {
        if (row.track_assignments) {
          trackAssignments[row.id] = row.track_assignments;
        } else {
          trackAssignments[row.id] = {};
        }
      });

      res.status(200).json(trackAssignments);
    } catch (error) {
      console.error('Error fetching track assignments:', error);
      res.status(200).json({});
    }
  } else if (req.method === 'POST') {
    try {
      const { scheduleId, station, track } = req.body;
      if (!scheduleId || !station) {
        res.status(400).json({ error: 'Missing scheduleId or station' });
        return;
      }

      // Fetch current track_assignments JSON for the schedule
      const selectQuery = 'SELECT track_assignments FROM schedules WHERE id = ?';
      const [rows] = await pool.query(selectQuery, [scheduleId]);
      if (rows.length === 0) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      let currentAssignments = rows[0].track_assignments || {};
      if (typeof currentAssignments === 'string') {
        try {
          currentAssignments = JSON.parse(currentAssignments);
        } catch {
          currentAssignments = {};
        }
      }

      // Update or insert the track assignment for the station
      currentAssignments[station] = track || null;

      // Update the schedules table with new track_assignments JSON
      const updateQuery = 'UPDATE schedules SET track_assignments = ? WHERE id = ?';
      await pool.query(updateQuery, [JSON.stringify(currentAssignments), scheduleId]);

      res.status(200).json({ message: 'Track assignment updated' });
    } catch (error) {
      console.error('Error updating track assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
