import pool from '../../../utils/db';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Get fiche horaire metadata to find file path
      const [results] = await pool.query('SELECT * FROM fiches_horaires WHERE id = ?', [id]);
      if (results.length === 0) {
        return res.status(404).json({ error: 'Fiche horaire non trouvée' });
      }
      const fiche = results[0];

      // Delete file from filesystem
      const filePath = path.join(process.cwd(), fiche.file_path);
      console.log('Deleting file at path:', filePath);
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath);
          console.log('File deleted successfully');
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
          return res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
        }
      } else {
        console.warn('File does not exist:', filePath);
      }

      // Delete metadata from DB
      await pool.query('DELETE FROM fiches_horaires WHERE id = ?', [id]);

      res.status(200).json({ message: 'Fiche horaire supprimée avec succès' });
    } catch (error) {
      console.error('Error deleting fiche horaire:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la fiche horaire' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}
