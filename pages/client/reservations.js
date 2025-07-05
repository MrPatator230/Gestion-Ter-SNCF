import { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../src/contexts/AuthContext';
import QRCodeTicket from '../../components/QRCodeTicket.js';
import { useRouter } from 'next/router';

export default function Reservations() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const savedReservations = localStorage.getItem(`reservations_${user.username || user.id}`);
      if (savedReservations) {
        setReservations(JSON.parse(savedReservations));
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Failed to parse reservations from localStorage:', error);
      setReservations([]);
    }
  }, [user]);

  // Listen for localStorage changes to update reservations in real-time
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === `reservations_${user.username || user.id}`) {
        try {
          const updatedReservations = JSON.parse(event.newValue || '[]');
          setReservations(updatedReservations);
        } catch (error) {
          console.error('Failed to parse updated reservations from localStorage:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const handleDeleteTicket = (ticketId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce billet ?')) {
      try {
        const updatedReservations = reservations.filter(ticket => ticket.id !== ticketId);
        localStorage.setItem(`reservations_${user.username || user.id}`, JSON.stringify(updatedReservations));
        setReservations(updatedReservations);
      } catch (error) {
        console.error('Failed to delete ticket:', error);
        alert('Une erreur est survenue lors de la suppression du billet.');
      }
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <h2>Mes Réservations</h2>
        {reservations.length === 0 ? (
          <p>Vous n'avez aucune réservation.</p>
        ) : (
          <div className="reservation-list">
            {reservations.map((ticket) => (
              <div key={ticket.id} className="reservation-card card mb-3 p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{ticket.typeName} - {ticket.schedule.trainType} {ticket.schedule.trainNumber}</h5>
                    <p>
                      {ticket.schedule.departureStation} ({ticket.schedule.departureTime}) → {ticket.schedule.arrivalStation} ({ticket.schedule.arrivalTime})
                    </p>
                    <p>Prix: {ticket.price} €</p>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => handleDeleteTicket(ticket.id)}
                  >
                    Supprimer
                  </button>
                </div>
                <QRCodeTicket ticketId={ticket.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
