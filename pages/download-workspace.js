import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function DownloadWorkspace() {
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      setIsValidToken(token === 'sncf-2024-secure');
    }
  }, []);

  const handleDownload = async () => {
    setIsLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    try {
      window.location.href = `/api/download-workspace?token=${token}`;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="download-page">
        {!isValidToken ? (
          <div className="error-container">
            <h1>Accès Refusé</h1>
            <p>Vous n'avez pas l'autorisation d'accéder à cette page.</p>
          </div>
        ) : (
          <div className="download-container">
            <h1>Téléchargement du Workspace</h1>
            <p>Cliquez sur le bouton ci-dessous pour télécharger l'ensemble du workspace</p>
            <button 
              onClick={handleDownload} 
              className="download-button"
              disabled={isLoading}
            >
              {isLoading ? 'Préparation du téléchargement...' : 'Télécharger le workspace'}
            </button>
          </div>
        )}

        <style jsx>{`
          .download-page {
            min-height: calc(100vh - 64px);
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f8f9fa;
            padding: 2rem;
          }

          .error-container,
          .download-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
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
        `}</style>
      </div>
    </Layout>
  );
}
