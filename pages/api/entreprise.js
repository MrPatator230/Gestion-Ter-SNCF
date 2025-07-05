import pool from '../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let connection;
    try {
      connection = await pool.getConnection();
      const [settingsRows] = await connection.query('SELECT * FROM entreprise_settings ORDER BY id DESC LIMIT 1');
      if (settingsRows.length === 0) {
        return res.status(200).json({
          entrepriseSettings: null,
          footerRegions: [],
          trainTypes: []
        });
      }
      const entrepriseSettings = settingsRows[0];

      const [footerRegions] = await connection.query('SELECT * FROM footer_regions WHERE entreprise_id = ?', [entrepriseSettings.id]);
      const [trainTypes] = await connection.query('SELECT * FROM train_types WHERE entreprise_id = ?', [entrepriseSettings.id]);

      res.status(200).json({
        entrepriseSettings,
        footerRegions,
        trainTypes
      });
    } catch (error) {
      console.error('Error fetching entreprise data:', error);
      res.status(500).json({ error: 'Failed to fetch entreprise data' });
    } finally {
      if (connection) connection.release();
    }
  } else if (req.method === 'POST') {
    const {
      entrepriseSettings,
      footerRegions,
      trainTypes
    } = req.body;

    if (!entrepriseSettings) {
      return res.status(400).json({ error: 'Missing entrepriseSettings data' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert or update entreprise_settings
      let entrepriseId;
      if (entrepriseSettings.id) {
        const updateQuery = `
          UPDATE entreprise_settings SET
            company_name = ?,
            company_slogan = ?,
            company_description = ?,
            primary_color = ?,
            secondary_color = ?,
            accent_color = ?,
            app_name = ?,
            logo_url = ?,
            favicon_url = ?,
            font_family = ?,
            button_style = ?,
            header_style = ?,
            footer_content = ?,
            custom_css = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        await connection.query(updateQuery, [
          entrepriseSettings.company_name,
          entrepriseSettings.company_slogan,
          entrepriseSettings.company_description,
          entrepriseSettings.primary_color,
          entrepriseSettings.secondary_color,
          entrepriseSettings.accent_color,
          entrepriseSettings.app_name,
          entrepriseSettings.logo_url,
          entrepriseSettings.favicon_url,
          entrepriseSettings.font_family,
          entrepriseSettings.button_style,
          entrepriseSettings.header_style,
          entrepriseSettings.footer_content,
          entrepriseSettings.custom_css,
          entrepriseSettings.id
        ]);
        entrepriseId = entrepriseSettings.id;
      } else {
        const insertQuery = `
          INSERT INTO entreprise_settings (
            company_name, company_slogan, company_description,
            primary_color, secondary_color, accent_color,
            app_name, logo_url, favicon_url,
            font_family, button_style, header_style,
            footer_content, custom_css
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(insertQuery, [
          entrepriseSettings.company_name,
          entrepriseSettings.company_slogan,
          entrepriseSettings.company_description,
          entrepriseSettings.primary_color,
          entrepriseSettings.secondary_color,
          entrepriseSettings.accent_color,
          entrepriseSettings.app_name,
          entrepriseSettings.logo_url,
          entrepriseSettings.favicon_url,
          entrepriseSettings.font_family,
          entrepriseSettings.button_style,
          entrepriseSettings.header_style,
          entrepriseSettings.footer_content,
          entrepriseSettings.custom_css
        ]);
        entrepriseId = result.insertId;
      }

      // Delete existing footer regions and insert new ones
      await connection.query('DELETE FROM footer_regions WHERE entreprise_id = ?', [entrepriseId]);
      if (Array.isArray(footerRegions)) {
        for (const region of footerRegions) {
          await connection.query(
            'INSERT INTO footer_regions (entreprise_id, name, link) VALUES (?, ?, ?)',
            [entrepriseId, region.name, region.link]
          );
        }
      }

      // Delete existing train types and insert new ones
      await connection.query('DELETE FROM train_types WHERE entreprise_id = ?', [entrepriseId]);
      if (Array.isArray(trainTypes)) {
        for (const trainType of trainTypes) {
          await connection.query(
            'INSERT INTO train_types (entreprise_id, type_name, logo_url) VALUES (?, ?, ?)',
            [entrepriseId, trainType.type_name, trainType.logo_url]
          );
        }
      }

      await connection.commit();
      res.status(200).json({ message: 'Entreprise data saved successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error saving entreprise data:', error);
      res.status(500).json({ error: 'Failed to save entreprise data' });
    } finally {
      connection.release();
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
