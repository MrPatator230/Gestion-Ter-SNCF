import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getAllStations } from '../utils/stationUtils';

export default function StationSearchForm({ searchQuery, setSearchQuery }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length >= 2) {
      const stations = getAllStations();
      const filtered = stations
        .filter(station => 
          station.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/horaires-par-gare/${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (stationName) => {
    setSearchQuery(stationName);
    setShowSuggestions(false);
    router.push(`/horaires-par-gare/${encodeURIComponent(stationName)}`);
  };

  return (
    <div className="station-search" ref={formRef}>
      <form onSubmit={handleSubmit} className="d-flex align-items-center">
        <div className="form-control-container w-100">
          <label htmlFor="station" className="form-label">Rechercher une gare</label>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="icons-search" aria-hidden="true"></i>
              </span>
            </div>
            <input
              type="text"
              id="station"
              className="form-control"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Saisissez le nom d'une gare..."
              autoComplete="off"
              aria-label="Rechercher une gare"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-container">
              <div className="list-group">
                {suggestions.map((station, index) => (
                  <button
                    key={station.name}
                    type="button"
                    className={`list-group-item list-group-item-action ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => handleSuggestionClick(station.name)}
                  >
                    <i className="icons-station icons-size-1x5 mr-2" aria-hidden="true"></i>
                    {station.name}
                    {station.categories && station.categories.length > 0 && (
                      <div className="station-categories">
                        {station.categories.map(category => (
                          <span key={category} className="badge badge-light ml-1">
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary ml-3">
          <i className="icons-search icons-size-1x5" aria-hidden="true"></i>
          <span className="ml-2">Rechercher</span>
        </button>
      </form>

      <style jsx>{`
        .station-search {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .suggestions-container {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1000;
          margin-top: 0.5rem;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .list-group-item {
          border-left: none;
          border-right: none;
          border-radius: 0;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
        }

        .list-group-item:first-child {
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
        }

        .list-group-item:last-child {
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .list-group-item.active {
          background-color: #f8f9fa;
          border-color: #ddd;
          color: #000;
        }

        .input-group-text {
          background-color: white;
          border-right: none;
        }

        .form-control {
          border-left: none;
        }

        .form-control:focus {
          box-shadow: none;
          border-color: #ddd;
        }

        .input-group-text i {
          color: #666;
        }

        .station-categories {
          margin-left: auto;
          font-size: 0.875rem;
        }

        .badge {
          font-weight: normal;
        }

        .icons-size-1x5 {
          font-size: 1.5rem;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}
