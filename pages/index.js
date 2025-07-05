import React, { useContext, useEffect, useState } from 'react';
import Header from '../components/Header';
import { SettingsContext } from '../contexts/SettingsContext';
import buttonStyles from '../styles/buttons.module.css';
import Layout from '../components/Layout';

const logoNameMap = {
  '/images/logo-ter-aura.svg': 'SNCF TER Aura',
  '/images/logo-ter-bretagne.svg': 'SNCF TER Bretagne',
  '/images/logo-ter-centre.svg': 'SNCF TER Centre',
  '/images/logo-ter-grand_est.svg': 'SNCF TER Grand Est',
  '/images/logo-ter-hdf.svg': 'SNCF TER Hauts-de-France',
  '/images/logo-ter-mobigo.svg': 'SNCF TER Mobigo',
  '/images/logo-ter-normandie.svg': 'SNCF TER Normandie',
  '/images/logo-ter-nouvelle_aquitaine.svg': 'SNCF TER Nouvelle Aquitaine',
  '/images/logo-ter-occitanie.svg': 'SNCF TER Occitanie',
  '/images/logo-ter-paca.svg': 'SNCF TER PACA',
  '/images/logo-ter-pddl.svg': 'SNCF TER PDDL',
};


function InfosTrafficsWidget({ onSelectInfo }) {
  const [trafficInfos, setTrafficInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInfos() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/infos-trafic');
        if (!res.ok) throw new Error('Erreur lors du chargement des infos trafic');
        const data = await res.json();
        setTrafficInfos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInfos();
  }, []);

  if (loading) {
    return (
      <div className="sncf-card h-100">
        <div className="sncf-card-body">
          <h2 className="h4 mb-3">Infos Trafic</h2>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sncf-card h-100">
        <div className="sncf-card-body">
          <h2 className="h4 mb-3">Infos Trafic</h2>
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  if (trafficInfos.length === 0) {
    return (
      <div className="sncf-card h-100">
        <div className="sncf-card-body">
          <h2 className="h4 mb-3">Infos Trafic</h2>
          <p>Aucune info trafic enregistrée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sncf-card h-100">
      <div className="sncf-card-body">
        <h2 className="h4 mb-3">Infos Trafic</h2>
        <div className="d-flex flex-wrap gap-3">
          {trafficInfos.map(info => (
            <div
              key={info.id}
              className="card p-3"
              style={{ cursor: 'pointer', minWidth: '250px', maxWidth: '300px' }}
              onClick={() => onSelectInfo(info)}
            >
              <h5>{info.title}</h5>
              <small>{info.startDate || '-'} {info.endDate ? `à ${info.endDate}` : ''}</small>
              <p className="mb-1">{info.description.length > 100 ? info.description.substring(0, 100) + '...' : info.description}</p>
              <span className={`badge bg-secondary`}>{info.impactType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



function ActualitesWidget({ onSelectPost }) {
  const [newsPosts, setNewsPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/actualites');
        if (!res.ok) throw new Error('Erreur lors du chargement des actualités');
        const data = await res.json();
        data.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA;
        });
        setNewsPosts(data.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="sncf-card h-100">
        <div className="sncf-card-body">
          <h2 className="h4 mb-3">Actualités</h2>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sncf-card h-100">
        <div className="sncf-card-body">
          <h2 className="h4 mb-3">Actualités</h2>
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  if (newsPosts.length === 0) {
    return (
      <div className="sncf-card h-100">
        <div className="sncf-card-body">
          <h2 className="h4 mb-3">Actualités</h2>
          <p>Aucune actualité enregistrée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sncf-card h-100">
      <div className="sncf-card-body">
        <h2 className="h4 mb-3">Actualités</h2>
        <ul className="list-unstyled">
          {newsPosts.map(post => (
            <li
              key={post.id}
              className="mb-3"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectPost(post)}
            >
              <strong>{post.title}</strong><br />
              <small>{post.date && !isNaN(new Date(post.date)) ? new Date(post.date).toLocaleDateString() : ''}</small><br />
              <p>{post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}</p>
            </li>
          ))}
        </ul>
        <a href="/actualites" className={`btn btn-primary ${buttonStyles['btn-primary']}`}>
          <span className="material-icons me-2">article</span>
          Voir toutes les actualités
        </a>
      </div>
    </div>
  );
}

export default function Home() {
  const { logoUrl } = useContext(SettingsContext);
  const displayName = logoNameMap[logoUrl] || 'SNCF TER Mobigo';

  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);

  const closePostModal = () => setSelectedPost(null);
  const closeInfoModal = () => setSelectedInfo(null);

  return (
    <>
      <div className="main-wrapper">
        <Layout>
          <main className="main-container">
            <div className="container-fluid">
              <h1 className="sncf-title mb-4">Bienvenue sur {displayName}</h1>

              <div className="row g-4">
                <div className="col-md-6">
                  <ActualitesWidget onSelectPost={setSelectedPost} />
                </div>

                <div className="col-md-6">
                  <InfosTrafficsWidget onSelectInfo={setSelectedInfo} />
                </div>

                <div className="col-md-6">
                  <div className="sncf-card h-100">
                    <div className="sncf-card-body">
                      <h2 className="h4 mb-3">Horaires et Itinéraires</h2>
                      <p>Consultez les horaires et planifiez vos trajets en quelques clics.</p>
                      <a href="/verifier-horaires" className={`btn btn-primary ${buttonStyles['btn-primary']}`}>
                        <span className="material-icons me-2">schedule</span>
                        Vérifier les horaires
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="sncf-card h-100">
                    <div className="sncf-card-body">
                      <h2 className="h4 mb-3">Abonnements & Billets</h2>
                      <p>Découvrez nos offres d'abonnement et achetez vos billets en ligne.</p>
                      <a href="/abonnements-et-billets" className={`btn btn-primary ${buttonStyles['btn-primary']}`}>
                        <span className="material-icons me-2">card_membership</span>
                        Voir les offres
                      </a>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="sncf-card h-100">
                    <div className="sncf-card-body">
                      <h2 className="h4 mb-3">Nos Gares</h2>
                      <p>Trouvez toutes les informations sur les gares de votre région.</p>
                      <a href="/stations" className={`btn btn-primary ${buttonStyles['btn-primary']}`}>
                        <span className="material-icons me-2">train</span>
                        Explorer les gares
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </Layout>
     
      </div>

      {/* Modal for Actualité */}
      {selectedPost && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          onClick={closePostModal}
        >
          <div
            className="modal-dialog modal-lg"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedPost.title}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closePostModal}></button>
              </div>
              <div className="modal-body">
                <small className="text-muted">{selectedPost.date && !isNaN(new Date(selectedPost.date)) ? new Date(selectedPost.date).toLocaleDateString() : ''}</small>
                <p>{selectedPost.content}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closePostModal}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Info Traffic */}
      {selectedInfo && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          onClick={closeInfoModal}
        >
          <div
            className="modal-dialog modal-lg"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedInfo.title}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeInfoModal}></button>
              </div>
              <div className="modal-body">
                <small className="text-muted">{selectedInfo.startDate || '-'} {selectedInfo.endDate ? `à ${selectedInfo.endDate}` : ''}</small>
                <p>{selectedInfo.description}</p>
                <span className={`badge bg-secondary`}>{selectedInfo.impactType}</span>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeInfoModal}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .sncf-card {
          border-color: var(--primary-color);
        }
        .sncf-title {
          color: var(--primary-color);
        }
      `}</style>
    </>
  );
}
