import fs from 'fs';
import path from 'path';

// Define paths
const audioDir = path.join(process.cwd(), 'public', 'audio');
const foldersFile = path.join(audioDir, 'folders.json');
const metadataFile = path.join(audioDir, 'metadata.json');

// Ensure directories and files exist
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

if (!fs.existsSync(foldersFile)) {
  fs.writeFileSync(foldersFile, JSON.stringify({ folders: [] }));
}

if (!fs.existsSync(metadataFile)) {
  fs.writeFileSync(metadataFile, JSON.stringify({}));
}

// Helper functions
function getFolders() {
  try {
    const data = fs.readFileSync(foldersFile, 'utf8');
    return JSON.parse(data).folders;
  } catch (error) {
    console.error('Error reading folders:', error);
    return [];
  }
}

function saveFolders(folders) {
  fs.writeFileSync(foldersFile, JSON.stringify({ folders }, null, 2));
}

function getMetadata() {
  try {
    const data = fs.readFileSync(metadataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading metadata:', error);
    return {};
  }
}

function saveMetadata(metadata) {
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
}

function findFileByIdWithExtension(fileId) {
  try {
    const files = fs.readdirSync(audioDir);
    return files.find(file => 
      file !== 'folders.json' && 
      file !== 'metadata.json' && 
      file.startsWith(fileId)
    );
  } catch (error) {
    console.error('Error finding file:', error);
    return null;
  }
}

export default async function handler(req, res) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        // List files or folders
        if (query.type === 'folders') {
          const folders = getFolders();
          res.status(200).json({ folders });
        } else {
          const folderId = query.folderId;
          const metadata = getMetadata();
          
          // Get all files in the audio directory
          const files = fs.readdirSync(audioDir)
            .filter(file => file !== 'folders.json' && file !== 'metadata.json')
            .map(filename => {
              const id = filename.split('-')[0]; // Get the ID part before the first hyphen
              const fileMetadata = metadata[id] || {};
              const stats = fs.statSync(path.join(audioDir, filename));
              
              return {
                id,
                name: fileMetadata.name || filename,
                url: `/audio/${filename}`,
                folderId: fileMetadata.folderId || null,
                size: stats.size,
                type: fileMetadata.type || 'audio/mpeg',
                createdAt: fileMetadata.createdAt || stats.birthtime
              };
            })
            .filter(file => {
              // If a folder ID is provided, only return files in that folder
              if (folderId) {
                const fileMetadata = metadata[file.id];
                return fileMetadata && fileMetadata.folderId === folderId;
              }
              // If no folder ID is provided, return files that are not in any folder
              return !metadata[file.id]?.folderId;
            });

          res.status(200).json({ files });
        }
        break;

      case 'POST':
        // Create new folder
        if (query.type === 'folders') {
          const { name } = req.body;
          if (!name) {
            return res.status(400).json({ error: 'Le nom du dossier est requis' });
          }

          const folders = getFolders();
          const newFolder = {
            id: Date.now().toString(),
            name,
            createdAt: new Date().toISOString()
          };

          folders.push(newFolder);
          saveFolders(folders);
          res.status(201).json(newFolder);
        } else {
          res.status(400).json({ error: 'Opération invalide' });
        }
        break;

      case 'PUT':
        if (query.type === 'folders' && query.id) {
          // Rename folder
          const { name } = req.body;
          const folders = getFolders();
          const folderIndex = folders.findIndex(f => f.id === query.id);

          if (folderIndex === -1) {
            return res.status(404).json({ error: 'Dossier non trouvé' });
          }

          folders[folderIndex].name = name;
          saveFolders(folders);
          res.status(200).json(folders[folderIndex]);
        } else if (query.type === 'move' && query.id) {
          // Move file to different folder
          const { folderId } = req.body;
          const metadata = getMetadata();
          
          if (!metadata[query.id]) {
            metadata[query.id] = {};
          }

          metadata[query.id].folderId = folderId;
          saveMetadata(metadata);
          res.status(200).json({ success: true });
        } else if (query.type === 'rename' && query.id) {
          // Rename file
          const { name } = req.body;
          const metadata = getMetadata();

          if (!metadata[query.id]) {
            metadata[query.id] = {};
          }

          metadata[query.id].name = name;
          saveMetadata(metadata);
          res.status(200).json({ success: true });
        } else {
          res.status(400).json({ error: 'Opération invalide' });
        }
        break;

      case 'DELETE':
        if (query.type === 'folders' && query.id) {
          // Delete folder
          const folders = getFolders();
          const newFolders = folders.filter(f => f.id !== query.id); // Fixed the condition here
          saveFolders(newFolders);

          // Update files in the folder to have no folder
          const metadata = getMetadata();
          Object.keys(metadata).forEach(fileId => {
            if (metadata[fileId].folderId === query.id) {
              metadata[fileId].folderId = null;
            }
          });
          saveMetadata(metadata);

          res.status(200).json({ success: true });
        } else if (query.id) {
          // Delete file
          const filename = findFileByIdWithExtension(query.id);

          if (!filename) {
            return res.status(404).json({ error: 'Fichier non trouvé' });
          }

          const filePath = path.join(audioDir, filename);
          
          try {
            // Delete the physical file
            fs.unlinkSync(filePath);
            
            // Remove from metadata
            const metadata = getMetadata();
            delete metadata[query.id];
            saveMetadata(metadata);

            res.status(200).json({ success: true });
          } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du fichier: ' + error.message });
          }
        } else {
          res.status(400).json({ error: 'Opération invalide' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Erreur interne du serveur: ' + error.message });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
