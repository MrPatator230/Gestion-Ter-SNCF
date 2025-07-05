import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ActualiteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (id) {
      const savedNews = localStorage.getItem('newsPosts');
      if (savedNews) {
        const newsPosts = JSON.parse(savedNews);
        const foundPost = newsPosts.find(p => p.id.toString() === id.toString());
        setPost(foundPost || null);
      }
    }
  }, [id]);

  if (!post) {
    return (
      <div className="container my-5">
        <p>Actualité non trouvée.</p>
        <Link href="/actualites">
          <a>Retour à la liste des actualités</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1>{post.title}</h1>
      <small className="text-muted">{new Date(post.date).toLocaleDateString()}</small>
      <p>{post.content}</p>
      <Link href="/actualites">
        <a>Retour à la liste des actualités</a>
      </Link>
    </div>
  );
}
