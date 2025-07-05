import fs from 'fs';
import path from 'path';

const annoncesFile = path.join(process.cwd(), 'data', 'annonces.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(annoncesFile)) {
        return res.status(200).json({ annonces: [] });
      }
      const data = fs.readFileSync(annoncesFile, 'utf-8');
      const annonces = JSON.parse(data);
      res.status(200).json({ annonces });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read annonces' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
