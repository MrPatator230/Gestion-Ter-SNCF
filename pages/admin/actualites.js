import { useState, useEffect, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../src/contexts/AuthContext';

export default function Actualites() {
  const { role, isAuthenticated } = useContext(AuthContext);

  const [newsPosts, setNewsPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({
    id: null,
    title: '',
    content: '',
    date: '',
    scheduled: false,
    icon: null,
    attachments: [],
  });

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      // Redirect to admin login or homepage if not authorized
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    const savedNews = localStorage.getItem('newsPosts');
    if (savedNews) {
      setNewsPosts(JSON.parse(savedNews));
    }
  }, []);

  const saveNewsPosts = (posts) => {
    setNewsPosts(posts);
    localStorage.setItem('newsPosts', JSON.stringify(posts));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      if (name === 'icon') {
        const file = files[0];
        setForm(prev => ({ ...prev, icon: file }));
      } else if (name === 'attachments') {
        const fileList = Array.from(files);
        setForm(prev => ({ ...prev, attachments: fileList }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content || (!form.date && form.scheduled)) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }
    const postToSave = {
      ...form,
      id: editingPost ? editingPost.id : Date.now(),
      icon: form.icon ? URL.createObjectURL(form.icon) : editingPost ? editingPost.icon : null,
      attachments: form.attachments.length > 0 ? form.attachments.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })) : editingPost ? editingPost.attachments : [],
    };
    let updatedPosts;
    if (editingPost) {
      updatedPosts = newsPosts.map(post => post.id === editingPost.id ? postToSave : post);
    } else {
      updatedPosts = [postToSave, ...newsPosts];
    }
    saveNewsPosts(updatedPosts);
    setForm({
      id: null,
      title: '',
      content: '',
      date: '',
      scheduled: false,
      icon: null,
      attachments: [],
    });
    setEditingPost(null);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setForm({
      id: post.id,
      title: post.title,
      content: post.content,
      date: post.date,
      scheduled: post.scheduled || false,
      icon: null,
      attachments: [],
    });
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer cette actualité ?')) {
      const updatedPosts = newsPosts.filter(post => post.id !== id);
      saveNewsPosts(updatedPosts);
    }
  };

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content" className="container mt-4 flex-grow-1">
          <h1>Gestion des Actualités</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Titre</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                id="scheduled"
                name="scheduled"
                className="form-check-input"
                checked={form.scheduled}
                onChange={handleInputChange}
              />
              <label htmlFor="scheduled" className="form-check-label">Programmer la publication</label>
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={form.date}
                onChange={handleInputChange}
                required={form.scheduled}
                disabled={!form.scheduled}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="icon" className="form-label">Icône de l'article</label>
              <input
                type="file"
                id="icon"
                name="icon"
                className="form-control"
                accept="image/*"
                onChange={handleInputChange}
              />
              {form.icon && (
                <img
                  src={URL.createObjectURL(form.icon)}
                  alt="Icon preview"
                  style={{ maxWidth: '100px', marginTop: '10px' }}
                />
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="attachments" className="form-label">Fichiers joints</label>
              <input
                type="file"
                id="attachments"
                name="attachments"
                className="form-control"
                multiple
                onChange={handleInputChange}
              />
              {form.attachments.length > 0 && (
                <ul className="list-group mt-2">
                  {form.attachments.map((file, index) => (
                    <li key={index} className="list-group-item">{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              {editingPost ? 'Mettre à jour' : 'Créer'}
            </button>
            {editingPost && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => {
                  setEditingPost(null);
                  setForm({
                    id: null,
                    title: '',
                    content: '',
                    date: '',
                    scheduled: false,
                    icon: null,
                    attachments: [],
                  });
                }}
              >
                Annuler
              </button>
            )}
          </form>

          <h2>Actualités existantes</h2>
          {newsPosts.length === 0 ? (
            <p>Aucune actualité enregistrée.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Programmé</th>
                  <th>Icône</th>
                  <th>Fichiers joints</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {newsPosts.map(post => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong></td>
                    <td>{new Date(post.date).toLocaleDateString()}</td>
                    <td>{post.scheduled ? 'Oui' : 'Non'}</td>
                    <td>
                      {post.icon ? (
                        <img src={post.icon} alt="Icon" style={{ maxWidth: '50px' }} />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {post.attachments && post.attachments.length > 0 ? (
                        <ul>
                          {post.attachments.map((file, idx) => (
                            <li key={idx}>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(post)}>Modifier</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
