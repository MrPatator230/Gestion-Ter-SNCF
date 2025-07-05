import { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../src/contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Initialize form with user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  }, [user, router]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Basic validation
    if (!formData.name || !formData.email) {
      setError('Le nom et l\'email sont obligatoires.');
      return;
    }

    // Update user info in context and localStorage
    const updatedUser = { ...user, ...formData };
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));

    setMessage('Informations mises à jour avec succès.');
  };

  if (!user) {
    return null; // or loading indicator
  }

  return (
    <Layout>
      <div className="container py-4">
        <h2>Mon Profil</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nom</label>
            <input 
              type="text" 
              className="form-control" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Téléphone</label>
            <input 
              type="tel" 
              className="form-control" 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="btn btn-primary">Mettre à jour</button>
        </form>
      </div>
    </Layout>
  );
}
