import Header from './Header';
import Head from 'next/head';
import Footer from './Footer';

export default function Layout({ children, darkMode, toggleDarkMode }) {
  return (
    <div className="main-wrapper d-flex flex-column min-vh-100">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="main-container flex-grow-1">
        <div className="container-fluid">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
