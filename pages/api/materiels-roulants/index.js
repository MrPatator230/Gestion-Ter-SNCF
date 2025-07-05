import pool from '../../../utils/db';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM materiels_roulants ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching materiels roulants:', error);
      res.status(500).json({ error: 'Failed to fetch materiels roulants' });
    }
  } else if (req.method === 'POST') {
    const { name, type, imageData } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    let imageUrl = null;
    if (imageData) {
        try {
            const dirPath = path.join(process.cwd(), 'public', 'images', 'materiel-roulant');
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            const matches = imageData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return res.status(400).json({ error: 'Invalid image data' });
            }

            const imageBuffer = Buffer.from(matches[2], 'base64');
            const fileExtension = matches[1].split('/')[1] || 'png';
            const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExtension}`;
            const filePath = path.join(dirPath, fileName);
            
            fs.writeFileSync(filePath, imageBuffer);
            imageUrl = `/images/materiel-roulant/${fileName}`;
        } catch (error) {
            console.error('Error saving image:', error);
            return res.status(500).json({ error: 'Failed to save image' });
        }
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO materiels_roulants (name, type, image_data) VALUES (?, ?, ?)',
        [name, type, imageUrl]
      );
      const newMateriel = { id: result.insertId, name, type, image_data: imageUrl };
      res.status(201).json(newMateriel);
    } catch (error) {
      console.error('Error creating materiel roulant:', error);
      res.status(500).json({ error: 'Failed to create materiel roulant' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
