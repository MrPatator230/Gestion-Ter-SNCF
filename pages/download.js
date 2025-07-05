import { useEffect } from 'react';
import Layout from '../components/Layout';

export default function Download() {
  useEffect(() => {
    // Cette fonction sera exécutée uniquement côté client
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      // Vérifie si le token est valide (vous pouvez modifier cette valeur)
      const validToken = 'sncf-2024-secure';
      
      if (token !== validToken) {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('download-section').style.display = 'none';
      }
    }
  }, []);

  const handleDownload = () => {
    // Déclenche le téléchargement du fichier
    const link = document.createElement('a');
    link.href = '';
    link.download = 'project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="download-page">
        <div id="error-message" style={{ display: 'none' }}>
          <div className="error-container">
            <h1>Accès Refusé</h1>
            <p>Vous n'avez pas l'autorisation d'accéder à cette page.</p>
          </div>
        </div>

        <div id="download-section">
          <div className="download-container">
            <h1>Téléchargement du Projet</h1>
            <p>Cliquez sur le bouton ci-dessous pour télécharger le fichier project.zip</p>
            <button onClick={handleDownload} className="download-button">
              Télécharger project.zip
            </button>
          </div>
        </div>

        <style jsx>{`
          .download-page {
            min-height: calc(100vh - 64px);
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f8f9fa;
          }

          .error-container,
          .download-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
          }

          .error-container {
            border-left: 4px solid #dc3545;
          }

          .download-container {
            border-left: 4px solid #000066;
          }

          h1 {
            color: #000066;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          p {
            color: #666;
            margin-bottom: 1.5rem;
          }

          .download-button {
            background-color: #000066;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .download-button:hover {
            background-color: #000044;
          }

          #error-message h1 {
            color: #dc3545;
          }
        `}</style>
      </div>
    </Layout>
  );
}
