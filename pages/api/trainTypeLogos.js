import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'trainTypeLogos.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(data);
      res.status(200).json(json);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read train type logos data.' });
    }
  } else if (req.method === 'POST') {
    try {
      const newData = req.body;
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');
      res.status(200).json({ message: 'Train type logos data updated successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to write train type logos data.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
