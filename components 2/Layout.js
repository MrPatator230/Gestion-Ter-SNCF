import Header from './Header';
import Head from 'next/head';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="main-wrapper d-flex flex-column min-vh-100">
      
      <Header />
      <main className="main-container flex-grow-1">
        <div className="container-fluid">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
