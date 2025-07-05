import pool from '../../../utils/db';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, type, imageData } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    try {
      const [existing] = await pool.query('SELECT image_data FROM materiels_roulants WHERE id = ?', [id]);
      let imageUrl = existing.length > 0 ? existing[0].image_data : null;

      if (imageData) {
        // A new image is being uploaded
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

            // If there was an old image, delete it
            if (imageUrl) {
                const oldPath = path.join(process.cwd(), 'public', imageUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            imageUrl = `/images/materiel-roulant/${fileName}`;
        } catch (error) {
            console.error('Error saving image:', error);
            return res.status(500).json({ error: 'Failed to save image' });
        }
      }

      await pool.query(
        'UPDATE materiels_roulants SET name = ?, type = ?, image_data = ?, updated_at = NOW() WHERE id = ?',
        [name, type, imageUrl, id]
      );
      
      const [updatedRows] = await pool.query('SELECT * FROM materiels_roulants WHERE id = ?', [id]);
      res.status(200).json(updatedRows[0]);

    } catch (error) {
      console.error('Error updating materiel roulant:', error);
      res.status(500).json({ error: 'Failed to update materiel roulant' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const [existing] = await pool.query('SELECT image_data FROM materiels_roulants WHERE id = ?', [id]);
      if (existing.length > 0 && existing[0].image_data) {
          const oldPath = path.join(process.cwd(), 'public', existing[0].image_data);
          if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
          }
      }
      await pool.query('DELETE FROM materiels_roulants WHERE id = ?', [id]);
      res.status(200).json({ message: 'Materiel roulant deleted successfully' });
    } catch (error) {
      console.error('Error deleting materiel roulant:', error);
      res.status(500).json({ error: 'Failed to delete materiel roulant' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
