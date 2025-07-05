import fs from 'fs';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'settings.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(settingsFilePath)) {
        const data = fs.readFileSync(settingsFilePath, 'utf-8');
        const settings = JSON.parse(data);
        res.status(200).json(settings);
      } else {
        // Return default settings if file does not exist
        res.status(200).json({
          companyName: 'Ma Société Ferroviaire',
          companySlogan: 'Le transport ferroviaire simplifié',
          companyDescription: 'Description de la société ferroviaire...',
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          appName: 'Train Schedule Management',
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read settings' });
    }
  } else if (req.method === 'POST') {
    try {
      const settings = req.body;
      console.log('Received settings:', settings);
      fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
      res.status(200).json({ message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
