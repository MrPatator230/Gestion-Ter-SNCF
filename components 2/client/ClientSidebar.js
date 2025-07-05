import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ClientSidebar({ activeTab, setActiveTab, onLogout, onDeleteAccount }) {
  const router = useRouter();

  return (
    <nav className="mastnav">
      <div className="mastnav-top">
        <div className="container">
          <h2 className="text-white mb-4">Espace Client</h2>
          <ul className="mastnav-list">
            <li>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`btn ${activeTab === 'upcoming' ? 'btn-white text-primary' : 'btn-transparent text-white'} w-100 mb-2`}
              >
                <i className="icons-calendar-ticket icons-size-1x5 mr-2" aria-hidden="true"></i>
                Prochaines Réservations
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('past')}
                className={`btn ${activeTab === 'past' ? 'btn-white text-primary' : 'btn-transparent text-white'} w-100 mb-2`}
              >
                <i className="icons-history icons-size-1x5 mr-2" aria-hidden="true"></i>
                Réservations Passées
              </button>
            </li>
            <li>
              <Link href="/abonnements-et-billets" className="btn btn-transparent text-white w-100 mb-2">
                <i className="icons-ticket icons-size-1x5 mr-2" aria-hidden="true"></i>
                Mes abonnements
              </Link>
            </li>
            <li>
              <Link href="/client/reservations" className="btn btn-transparent text-white w-100 mb-2">
                <i className="icons-ticket icons-size-1x5 mr-2" aria-hidden="true"></i>
                Mes réservations
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mastnav-bottom bg-darker p-4">
        <div className="container">
          <button 
            onClick={onDeleteAccount} 
            className="btn btn-danger btn-block mb-3"
          >
            <i className="icons-delete icons-size-1x5 mr-2" aria-hidden="true"></i>
            Supprimer mon compte
          </button>
          <button 
            onClick={onLogout} 
            className="btn btn-ghost-white btn-block"
          >
            <i className="icons-logout icons-size-1x5 mr-2" aria-hidden="true"></i>
            Se déconnecter
          </button>
        </div>
      </div>

      <style jsx>{`
        .mastnav {
          width: 280px;
          background-color: #00a1e5;
          color: white;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        .mastnav-top {
          flex-grow: 1;
          padding: 2rem 0;
          overflow-y: auto;
        }

        .mastnav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mastnav-list li {
          margin-bottom: 1rem;
        }

        .btn-transparent {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-transparent:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .bg-darker {
          background-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </nav>
  );
}
