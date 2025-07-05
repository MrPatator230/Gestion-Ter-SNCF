import pool from '../../../utils/db';

export default async function handler(req, res) {
  try {
    const query = 'SELECT * FROM ticket_types';
    const [rows] = await pool.query(query);

    // Transform keys from snake_case to camelCase
    const camelCaseRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: row.price,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.status(200).json(camelCaseRows);
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
