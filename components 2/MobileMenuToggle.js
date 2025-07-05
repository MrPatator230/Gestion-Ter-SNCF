import { useState } from 'react';

export default function MobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    const sidebar = document.querySelector('.sncf-sidebar');
    sidebar.classList.toggle('show');
    setIsOpen(!isOpen);
  };

  return (
    <button
      className="sncf-mobile-toggle d-md-none"
      onClick={toggleMenu}
      aria-label="Toggle menu"
    >
      <span className="material-icons">
        {isOpen ? 'close' : 'menu'}
      </span>
    </button>
  );
}
