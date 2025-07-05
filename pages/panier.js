import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { AuthContext } from '../src/contexts/AuthContext';

export default function Panier() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const cartKey = `ticketCart_${user.username || user.id}`;
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [user, router]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === `ticketCart_${user.username || user.id}`) {
        const updatedCart = JSON.parse(event.newValue || '[]');
        setCartItems(updatedCart);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const removeItem = (id) => {
    const cartKey = `ticketCart_${user.username || user.id}`;
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  };

  const validateCart = () => {
    if (cartItems.length === 0) {
      alert('Votre panier est vide.');
      return;
    }
    const savedReservations = localStorage.getItem(`reservations_${user.username || user.id}`);
    const reservations = savedReservations ? JSON.parse(savedReservations) : [];
    const updatedReservations = [...reservations, ...cartItems];
    localStorage.setItem(`reservations_${user.username || user.id}`, JSON.stringify(updatedReservations));
    localStorage.removeItem(`ticketCart_${user.username || user.id}`);
    setCartItems([]);
    alert('Panier validé avec succès ! Vos billets sont maintenant réservés.');
    router.push('/client/reservations');
  };

  return (
    <Layout>
      <div className="container py-4">
        <h2>Votre Panier</h2>
        {cartItems.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <>
            <ul className="list-group mb-3">
              {cartItems.map(item => (
                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{item.typeName}</strong> - {item.schedule.trainType} {item.schedule.trainNumber}<br />
                    {item.schedule.departureStation} ({item.schedule.departureTime}) → {item.schedule.arrivalStation} ({item.schedule.arrivalTime})<br />
                    Prix: {item.price} €
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>Supprimer</button>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={validateCart}>Valider le panier</button>
          </>
        )}
      </div>
    </Layout>
  );
}
