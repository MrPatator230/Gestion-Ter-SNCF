import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const audioDir = path.join(process.cwd(), 'public', 'audio');
const metadataFile = path.join(audioDir, 'metadata.json');

// Ensure directories exist
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Initialize metadata file if it doesn't exist
if (!fs.existsSync(metadataFile)) {
  fs.writeFileSync(metadataFile, JSON.stringify({}));
}

function getMetadata() {
  try {
    return JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
  } catch (error) {
    console.error('Error reading metadata:', error);
    return {};
  }
}

function saveMetadata(metadata) {
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, audioDir);
  },
  filename: function (req, file, cb) {
    const fileId = Date.now().toString();
    const originalExt = path.extname(file.originalname);
    const randomSuffix = Math.floor(Math.random() * 1000000000);
    cb(null, `${fileId}-${randomSuffix}${originalExt}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio sont acceptés.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Erreur lors du téléchargement: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Méthode '${req.method}' non autorisée` });
  },
});

apiRoute.use(upload.array('files'));

apiRoute.post((req, res) => {
  try {
    const metadata = getMetadata();
    const uploadedFiles = req.files.map(file => {
      const fileId = path.basename(file.filename, path.extname(file.filename)).split('-')[0];
      const fileInfo = {
        id: fileId,
        name: file.originalname,
        url: `/audio/${file.filename}`,
        folderId: req.body.folderId || null,
        type: file.mimetype,
        size: file.size,
        createdAt: new Date().toISOString()
      };
      
      // Save file metadata
      metadata[fileId] = fileInfo;
      
      return fileInfo;
    });

    // Save updated metadata
    saveMetadata(metadata);

    res.status(200).json({ uploadedFiles });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du fichier' });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;
