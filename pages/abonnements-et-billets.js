import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '../src/contexts/AuthContext';
import Header from '../components/Header';

export default function AbonnementsEtBillets() {
  const [ticketTypes, setTicketTypes] = useState([]);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const response = await fetch('/api/ticket-types');
        if (!response.ok) {
          throw new Error('Failed to fetch ticket types');
        }
        const data = await response.json();
        setTicketTypes(data);
      } catch (error) {
        console.error('Error fetching ticket types:', error);
        setTicketTypes([]);
      }
    };

    fetchTicketTypes();
  }, []);

  const abonnements = ticketTypes.filter(type => type.category === 'Abonnement');
  const billets = ticketTypes.filter(type => type.category === 'Billet');

  const handleReservation = (type) => {
    if (!user) {
      alert('Vous devez être connecté pour réserver.');
      router.push('/login');
      return;
    }
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const newReservation = {
      id: Date.now().toString(),
      typeId: type.id,
      typeName: type.name,
      price: type.price,
      category: type.category,
      date: new Date().toISOString(),
    };
    const updatedReservations = [...reservations, newReservation];
    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
    alert('Réservation réussie !');
  };

  return (

     <div className="main-wrapper">
           <Header />
    <div className="container my-5">
      <h1>Abonnements et Billets</h1>

      <section className="mb-5">
        <h2>Abonnements</h2>
        {abonnements.length === 0 ? (
          <p>Aucun abonnement disponible.</p>
        ) : (
          <div className="list-group">
            {abonnements.map((sub) => (
              <div key={sub.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{sub.name}</strong> - {sub.price} €
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleReservation(sub)}>
                  Souscrire
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Billets</h2>
        {billets.length === 0 ? (
          <p>Aucun billet disponible.</p>
        ) : (
          <div className="list-group">
            {billets.map((type) => (
              <div key={type.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{type.name}</strong> - {type.price} €
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleReservation(type)}>
                  Réserver
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </div>
  );
}
