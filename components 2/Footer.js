import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa6';

export default function Footer() {
  const { footerRegions, logoUrl } = useContext(SettingsContext);

  const handleRegionChange = (e) => {
    const selectedLink = e.target.value;
    if (selectedLink) {
      window.location.href = selectedLink;
    }
  };

  const navLinks = [
    { label: 'CGU / CGV', href: '#' },
    { label: 'Confidentialité/Cookies', href: '#' },
    { label: 'Gares', href: '#' },
    { label: 'Lignes', href: '#' },
    { label: 'MOBIGO', href: '#' },
    { label: 'Accessibilité : partiellement conforme', href: '#' },
    { label: 'Mentions légales', href: '#' },
    { label: 'Plan du site', href: '#' },
    { label: 'Contacts', href: '#' },
    { label: "Demande d'information et réclamations", href: '#' },
  ];

  return (
    <footer className="bg-white border-top">
      {/* Top bar */}
      <div className="container py-3">
        <div className="row align-items-center">
          {/* Region dropdown */}
          <div className="col-md-4">
            <select
              className="form-select w-auto"
              onChange={handleRegionChange}
              defaultValue=""
              aria-label="Changer de région"
            >
              <option value="" disabled>Changer de région</option>
              {footerRegions && footerRegions.map((region, idx) => (
                <option key={idx} value={region.link}>{region.name}</option>
              ))}
            </select>
          </div>

          {/* Social icons */}
          <div className="col-md-4 text-center">
            <div className="d-flex justify-content-center gap-4">
              <a href="https://www.facebook.com/sncf" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-success">
                <FaFacebookF size={20} />
              </a>
              <a href="https://twitter.com/sncf" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-success">
                <FaTwitter size={20} />
              </a>
              <a href="https://www.instagram.com/sncf" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-success">
                <FaInstagram size={20} />
              </a>
              <a href="https://www.youtube.com/sncf" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-success">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Logos */}
          <div className="col-md-4">
            <div className="d-flex justify-content-end align-items-center gap-3">
              <img src={logoUrl || "/images/logo-ter-mobigo.svg"} alt="Selected TER Logo" style={{ height: '32px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="m-0" />

      {/* Bottom nav */}
      <div className="container py-2">
        <nav>
          <ul className="list-unstyled d-flex flex-wrap justify-content-center gap-3 m-0">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="text-secondary text-decoration-none small">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
