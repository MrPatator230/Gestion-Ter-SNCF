import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';


export default function Actualites() {
  const [newsPosts, setNewsPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const savedNews = localStorage.getItem('newsPosts');
    if (savedNews) {
      setNewsPosts(JSON.parse(savedNews));
    }
  }, []);

  const openModal = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = newsPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(newsPosts.length / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <>
      <Header />

      <div className="container my-5">
        <h1>Actualités</h1>
        {newsPosts.length === 0 ? (
          <p>Aucune actualité disponible.</p>
        ) : (
          <>
            <div className="list-group">
              {currentPosts.map(post => (
                <div
                  key={post.id}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openModal(post)}
                >
                  <h5>{post.title}</h5>
                <small className="text-muted">
                  {post.date && !isNaN(new Date(post.date)) ? new Date(post.date).toLocaleDateString() : ''}
                </small>
                <p>{post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}</p>
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-2">
                    <strong>Fichiers joints:</strong>
                    <ul>
                      {post.attachments.map((file, idx) => (
                        <li key={idx}>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              ))}
            </div>

            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={handlePrevPage}>Précédente</button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    Page {currentPage} sur {totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={handleNextPage}>Suivante</button>
                </li>
              </ul>
            </nav>
          </>
        )}

        {/* Modal */}
        {selectedPost && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
            role="dialog"
            onClick={closeModal}
          >
            <div
              className="modal-dialog modal-lg"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedPost.title}</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <small className="text-muted">{new Date(selectedPost.date).toLocaleDateString()}</small>
                  <p>{selectedPost.content}</p>
                  {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                    <div className="mt-3">
                      <strong>Fichiers joints :</strong>
                      <ul className="list-unstyled d-flex flex-wrap gap-3 mt-2">
                        {selectedPost.attachments.map((file, idx) => (
                          <li key={idx}>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                              {file.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Fermer</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
