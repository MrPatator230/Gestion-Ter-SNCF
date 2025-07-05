import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import { useRouter } from 'next/router';
import ClientSidebar from '../../components/client/ClientSidebar';
import ReservationList from '../../components/client/ReservationList';
import Layout from '../../components/Layout';

export default function Client() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  useEffect(() => {
    if (username) {
      const allReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
      const userReservations = allReservations.filter(r => r.username === username);
      setReservations(userReservations);
    }
  }, [username]);

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      if (!username) return;

      let users = JSON.parse(localStorage.getItem('users') || '[]');
      users = users.filter(user => user.username !== username);
      localStorage.setItem('users', JSON.stringify(users));

      // Clear auth tokens and logout
      logout();
      router.push('/login');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCancelReservation = (id) => {
    if (window.confirm('Voulez-vous annuler cette réservation ?')) {
      let allReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
      allReservations = allReservations.filter(r => r.id !== id);
      localStorage.setItem('reservations', JSON.stringify(allReservations));
      setReservations(reservations.filter(r => r.id !== id));
    }
  };

  const now = new Date();
  const upcomingReservations = reservations.filter(r => new Date(r.date) >= now);
  const pastReservations = reservations.filter(r => new Date(r.date) < now);

  return (
    <Layout>
      <div className="client-dashboard">
        <ClientSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
        
        <main className="main-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <nav className="breadcrumb bg-transparent">
                  <span className="breadcrumb-item active">Espace Client</span>
                </nav>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1 className="mb-0">Bienvenue dans votre espace client</h1>
                  <button
                    onClick={() => router.push('/abonnements-et-billets')}
                    className="btn btn-primary"
                  >
                    <i className="icons-ticket icons-size-1x5 mr-2" aria-hidden="true"></i>
                    Acheter un billet
                  </button>
                </div>

                {activeTab === 'upcoming' && (
                  <section>
                    <div className="card">
                      <div className="card-header">
                        <h2 className="h4 mb-0">
                          <i className="icons-calendar-ticket icons-size-1x5 mr-2" aria-hidden="true"></i>
                          Prochaines Réservations
                        </h2>
                      </div>
                      <div className="card-body">
                        <ReservationList
                          reservations={upcomingReservations}
                          isPast={false}
                          onCancel={handleCancelReservation}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'past' && (
                  <section>
                    <div className="card">
                      <div className="card-header">
                        <h2 className="h4 mb-0">
                          <i className="icons-history icons-size-1x5 mr-2" aria-hidden="true"></i>
                          Réservations Passées
                        </h2>
                      </div>
                      <div className="card-body">
                        <ReservationList
                          reservations={pastReservations}
                          isPast={true}
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </main>

        <style jsx>{`
          .client-dashboard {
            display: flex;
            min-height: calc(100vh - 64px); /* Adjust based on header height */
          }

          .main-content {
            flex: 1;
            padding: 2rem;
            background-color: #f8f9fa;
            overflow-y: auto;
          }

          .card {
            border: none;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .card-header {
            background-color: white;
            border-bottom: 1px solid #e9ecef;
            padding: 1.25rem;
          }

          .breadcrumb {
            padding: 0.5rem 0;
            margin-bottom: 1.5rem;
          }

          h1 {
            color: #333;
            font-size: 1.75rem;
          }

          .h4 {
            color: #495057;
          }

          .icons-size-1x5 {
            font-size: 1.5rem;
            vertical-align: middle;
          }
        `}</style>
      </div>
    </Layout>
  );
}
