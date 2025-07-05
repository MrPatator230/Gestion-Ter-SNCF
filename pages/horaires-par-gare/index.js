import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import StationSearchForm from '../../components/StationSearchForm';

export default function HorairesParGare() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [showPopup, setShowPopup] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const openPopup = (station) => {
    setSelectedStation(station);
    setMessage(station.message || '');
    setError(null);
    setSuccess(null);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedStation(null);
    setMessage('');
    setError(null);
    setSuccess(null);
  };

  const saveMessage = async () => {
    if (!selectedStation) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/stations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStation.id, message }),
      });
      if (!response.ok) {
        throw new Error('Failed to save message');
      }
      setSuccess('Message enregistré avec succès');
      // Update stations state with new message
      setStations((prevStations) =>
        prevStations.map((st) =>
          st.id === selectedStation.id ? { ...st, message } : st
        )
      );
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <nav className="breadcrumb bg-transparent">
              <span className="breadcrumb-item">
                <i className="icons-home icons-size-1x5" aria-hidden="true"></i>
              </span>
              <span className="breadcrumb-item active">Horaires par gare</span>
            </nav>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h1 className="h4 mb-0">
                  <i className="icons-station icons-size-1x5 mr-2" aria-hidden="true"></i>
                  Rechercher les horaires d'une gare
                </h1>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <p className="lead mb-0">
                    Consultez les horaires des trains au départ et à l'arrivée de votre gare
                  </p>
                </div>
                <StationSearchForm searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              </div>
            </div>

            <div className="card border-0 shadow-sm mt-4">
              <div className="card-header bg-light">
                <h2 className="h5 mb-0">Gares disponibles</h2>
              </div>
              <div className="card-body">
                {loading ? (
                  <div>Chargement des gares...</div>
                ) : filteredStations.length === 0 ? (
                  <div>Aucune gare trouvée.</div>
                ) : (
                  <ul className="list-unstyled">
                    {filteredStations.map((station) => (
                      <li key={station.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link legacyBehavior href={`/horaires-par-gare/${encodeURIComponent(station.name)}`}>
                          <a>{station.name}</a>
                        </Link>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openPopup(station)}>
                          Définir message
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {showPopup && (
              <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title">
                <div className="popup-content">
                  <h3 id="popup-title">Message pour la gare: {selectedStation.name}</h3>
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Entrez le message à diffuser"
                    disabled={saving}
                  />
                  {error && <p className="text-danger">{error}</p>}
                  {success && <p className="text-success">{success}</p>}
                  <div className="popup-buttons">
                    <button className="btn btn-primary" onClick={saveMessage} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button className="btn btn-secondary" onClick={closePopup} disabled={saving}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

  

            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h2 className="h5 mb-3">
                      <i className="icons-info icons-size-1x5 mr-2" aria-hidden="true"></i>
                      Comment ça marche ?
                    </h2>
                    <ol className="pl-3">
                      <li className="mb-2">Saisissez le nom de votre gare dans le champ de recherche</li>
                      <li className="mb-2">Sélectionnez votre gare dans la liste des suggestions</li>
                      <li>Consultez les horaires des trains au départ et à l'arrivée</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h2 className="h5 mb-3">
                      <i className="icons-calendar icons-size-1x5 mr-2" aria-hidden="true"></i>
                      Informations disponibles
                    </h2>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="icons-clock-forward mr-2" aria-hidden="true"></i>
                        Horaires des départs
                      </li>
                      <li className="mb-2">
                        <i className="icons-clock-back mr-2" aria-hidden="true"></i>
                        Horaires des arrivées
                      </li>
                      <li className="mb-2">
                        <i className="icons-calendar-ticket mr-2" aria-hidden="true"></i>
                        Jours de circulation
                      </li>
                      <li>
                        <i className="icons-info mr-2" aria-hidden="true"></i>
                        Informations sur les trains
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border-radius: 8px;
        }

        .card-header {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }

        .lead {
          color: #666;
        }

        .icons-size-1x5 {
          font-size: 1.5rem;
          vertical-align: middle;
        }

        .breadcrumb {
          padding: 1rem 0;
        }

        .list-unstyled li {
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .list-unstyled li a {
          color: #007bff;
          text-decoration: none;
        }

        .list-unstyled li a:hover {
          text-decoration: underline;
        }

        .list-unstyled i {
          color: #000044;
        }

        ol {
          color: #495057;
        }

        .card-body {
          padding: 2rem;
        }
      `}</style>
    </Layout>
  );
}
