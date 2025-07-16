import { IncomingForm } from 'formidable';
import xlsx from 'xlsx';
import pool from '../../../utils/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error parsing the form data.' });
    }

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const workbook = xlsx.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // --- Category Creation Logic ---
      const allCategoryNames = new Set();
      for (const row of data) {
        const categories = row.categories || row.types_de_gare;
        if (categories) {
          String(categories).split(',').forEach(cat => {
            if (cat && cat.trim()) allCategoryNames.add(cat.trim());
          });
        }
      }

      const categoryList = Array.from(allCategoryNames).filter(Boolean);
      if (categoryList.length > 0) {
        const placeholders = categoryList.map(() => '?').join(',');
        const [existingCategoryRows] = await connection.execute(`SELECT name FROM station_types WHERE name IN (${placeholders})`, categoryList);
        const existingCategories = new Set(existingCategoryRows.map(r => r.name));
        const newCategories = categoryList.filter(name => !existingCategories.has(name));

        if (newCategories.length > 0) {
          const categoryInsertQuery = `INSERT INTO station_types (name) VALUES ?`;
          const categoryValues = newCategories.map(name => [name]);
          await connection.execute(categoryInsertQuery, [categoryValues]);
        }
      }
      // --- End Category Creation ---

      let createdCount = 0;
      let updatedCount = 0;

      for (const row of data) {
        const stationName = row.name || row.nom_de_la_gare;
        if (!stationName) {
          continue; // Skip rows without a station name
        }

        const stationData = {
          name: String(stationName).trim(),
          locationType: row.locationType || row.type_de_localisation || 'Ville',
          categories: String(row.categories || row.types_de_gare || '').split(',').map(c => c.trim()).filter(Boolean),
        };

        const [rows] = await connection.execute('SELECT * FROM stations WHERE name = ?', [stationData.name]);
        const existingStation = rows[0];

        if (existingStation) {
          // Update existing station
          const updateQuery = `
            UPDATE stations SET
              locationType = ?,
              categories = ?
            WHERE name = ?
          `;
          await connection.execute(updateQuery, [
            stationData.locationType,
            JSON.stringify(stationData.categories),
            stationData.name
          ]);
          updatedCount++;
        } else {
          // Create new station
          const insertQuery = `
            INSERT INTO stations (name, locationType, categories)
            VALUES (?, ?, ?)
          `;
          await connection.execute(insertQuery, [
            stationData.name,
            stationData.locationType,
            JSON.stringify(stationData.categories)
          ]);
          createdCount++;
        }
      }

      await connection.commit();
      res.status(200).json({ created: createdCount, updated: updatedCount });

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error processing Excel file:', error);
      res.status(500).json({ message: 'Error processing Excel file: ' + error.message });
    } finally {
      if (connection) connection.release();
    }
  });
}
