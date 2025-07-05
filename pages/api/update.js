import { exec } from 'child_process';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // TODO: Add authentication/authorization check here

  exec('git pull && npm install && npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Update error: ${error.message}`);
      return res.status(500).json({ message: 'Update failed', error: error.message });
    }
    if (stderr) {
      console.error(`Update stderr: ${stderr}`);
    }
    console.log(`Update stdout: ${stdout}`);
    res.status(200).json({ message: 'Update successful', output: stdout });
  });
}
