import mysql from 'mysql2/promise';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const fichesDir = path.join(process.cwd(), 'public', 'fiches-horaires');

async function query(sql, params) {
  console.log('Connecting to DB with:', {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
  });
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 8889,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  const [results] = await connection.execute(sql, params);
  await connection.end();
  return results;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const results = await query('SELECT * FROM fiches_horaires ORDER BY created_at DESC');
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching fiches horaires:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des fiches horaires' });
    }
  } else if (req.method === 'POST') {
    // Ensure fichesDir exists before parsing form
    if (!fs.existsSync(fichesDir)) {
      fs.mkdirSync(fichesDir, { recursive: true });
    }

    const form = formidable({
      allowEmptyFiles: false, // disallow empty files, will throw error if empty
    });
    form.uploadDir = fichesDir;
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Erreur lors du traitement du fichier' });
      }

      const displayName = fields.displayName;
      let file = files.file;

      // If files.file is an array, use the first element
      if (Array.isArray(file)) {
        file = file[0];
      }

      console.log('Uploaded file object:', file);

      if (!displayName || !file) {
        return res.status(400).json({ error: 'Nom d\'affichage et fichier sont requis' });
      }

      if (file.size === 0) {
        return res.status(400).json({ error: 'Le fichier téléchargé est vide' });
      }

      // Move the uploaded file to the fichesDir with original filename
      const oldPath = file.filepath || file.path;

      if (!oldPath || typeof oldPath !== 'string') {
        console.error('Uploaded file path is missing or invalid');
        return res.status(400).json({ error: 'Chemin du fichier téléchargé manquant ou invalide' });
      }

      let fileName = file.originalFilename || file.name;

      // Ensure fileName is defined, assign default if not
      if (!fileName || typeof fileName !== 'string') {
        fileName = 'uploaded_file';
      }

      // Sanitize filename by replacing invalid characters with underscore
      fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

      const newPath = path.join(fichesDir, fileName);

      try {
        // Check if file with same name exists, if yes, rename with timestamp
        let finalPath = newPath;
        if (fs.existsSync(newPath)) {
          const timestamp = Date.now();
          const ext = path.extname(fileName);
          const baseName = path.basename(fileName, ext);
          finalPath = path.join(fichesDir, `${baseName}-${timestamp}${ext}`);
        }

        await fs.promises.rename(oldPath, finalPath);

        // Store metadata in DB
        const relativePath = path.relative(process.cwd(), finalPath).replace(/\\/g, '/');
        const result = await query(
          'INSERT INTO fiches_horaires (display_name, file_path) VALUES (?, ?)',
          [displayName, relativePath]
        );

        res.status(201).json({ id: result.insertId, displayName, filePath: relativePath });
      } catch (error) {
        console.error('Error saving file or metadata:', error.stack || error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement du fichier' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}
