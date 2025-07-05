import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  // Vérifier le token
  const { token } = req.query;
  const validToken = 'sncf-2024-secure';

  if (token !== validToken) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    // Créer un fichier zip temporaire
    const tempZipPath = path.join(process.cwd(), 'workspace.zip');
    
    // Créer le zip en excluant node_modules et .git
    await execAsync(`zip -r ${tempZipPath} . -x "node_modules/*" "*.git/*"`);

    // Lire le fichier zip
    const zipFile = fs.readFileSync(tempZipPath);

    // Supprimer le fichier temporaire
    fs.unlinkSync(tempZipPath);

    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=workspace.zip');
    return res.send(zipFile);
  } catch (error) {
    console.error('Erreur lors de la création du zip:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du fichier zip' });
  }
}
