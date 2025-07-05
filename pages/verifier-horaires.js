

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import SuggestionList from '../components/SuggestionList';

export default function VerifierHoraires() {
  const router = useRouter();
  const [stations, setStations] = useState([]);
  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [viaStation, setViaStation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [showVia, setShowVia] = useState(false);

  // États pour les suggestions
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [viaSuggestions, setViaSuggestions] = useState([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);
  const [showViaSuggestions, setShowViaSuggestions] = useState(false);

  // États pour l'index sélectionné dans les suggestions
  const [departureSelectedIndex, setDepartureSelectedIndex] = useState(-1);
  const [arrivalSelectedIndex, setArrivalSelectedIndex] = useState(-1);
  const [viaSelectedIndex, setViaSelectedIndex] = useState(-1);

  // Refs pour gérer le clic en dehors des suggestions
  const departureRef = useRef(null);
  const arrivalRef = useRef(null);
  const viaRef = useRef(null);

  useEffect(() => {
  // Charger les stations depuis l'API
  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const data = await response.json();
      setStations(data.map(station => station.name));
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStations([]);
    }
  };

  fetchStations();

    // Ajouter les gestionnaires de clic pour fermer les suggestions
    const handleClickOutside = (event) => {
      if (departureRef.current && !departureRef.current.contains(event.target)) {
        setShowDepartureSuggestions(false);
        setDepartureSelectedIndex(-1);
      }
      if (arrivalRef.current && !arrivalRef.current.contains(event.target)) {
        setShowArrivalSuggestions(false);
        setArrivalSelectedIndex(-1);
      }
      if (viaRef.current && !viaRef.current.contains(event.target)) {
        setShowViaSuggestions(false);
        setViaSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterStations = (input, excludeStations = []) => {
    if (input.length < 2) return [];
    return stations
      .filter(station => 
        station.toLowerCase().includes(input.toLowerCase()) &&
        !excludeStations.includes(station)
      )
      .slice(0, 5); // Limiter à 5 suggestions
  };

  const handleDepartureChange = (e) => {
    const value = e.target.value;
    setDepartureStation(value);
    setDepartureSuggestions(filterStations(value, [arrivalStation, viaStation]));
    setShowDepartureSuggestions(true);
    setDepartureSelectedIndex(-1);
  };

  const handleArrivalChange = (e) => {
    const value = e.target.value;
    setArrivalStation(value);
    setArrivalSuggestions(filterStations(value, [departureStation, viaStation]));
    setShowArrivalSuggestions(true);
    setArrivalSelectedIndex(-1);
  };

  const handleViaChange = (e) => {
    const value = e.target.value;
    setViaStation(value);
    setViaSuggestions(filterStations(value, [departureStation, arrivalStation]));
    setShowViaSuggestions(true);
    setViaSelectedIndex(-1);
  };

  const handleStationSelect = (station, type) => {
    switch (type) {
      case 'departure':
        setDepartureStation(station);
        setShowDepartureSuggestions(false);
        setDepartureSelectedIndex(-1);
        break;
      case 'arrival':
        setArrivalStation(station);
        setShowArrivalSuggestions(false);
        setArrivalSelectedIndex(-1);
        break;
      case 'via':
        setViaStation(station);
        setShowViaSuggestions(false);
        setViaSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Rediriger vers la page des résultats avec les paramètres de recherche
    const query = {
      departureStation,
      arrivalStation,
      departureDate,
      ...(returnDate && { returnDate }),
      ...(showVia && viaStation && { viaStation })
    };

    router.push({
      pathname: '/offers',
      query
    });
  };

  return (
    <Layout>
      <div className="search-container">
        <h1 className="search-title">Rechercher un horaire</h1>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-group">
            <div className="field-group" ref={departureRef}>
              <span className="material-icons location-icon">place</span>
              <div className="field-content">
                <label>Gare de départ</label>
                <input
                  type="text"
                  value={departureStation}
                  onChange={handleDepartureChange}
                  placeholder="Veuillez saisir au moins 2 caractères dans ce champ."
                  required
                />
                {showDepartureSuggestions && (
                  <SuggestionList
                    suggestions={departureSuggestions}
                    selectedIndex={departureSelectedIndex}
                    onSelect={(station) => handleStationSelect(station, 'departure')}
                  />
                )}
              </div>
            </div>

            <div className="field-group" ref={arrivalRef}>
              <span className="material-icons location-icon">place</span>
              <div className="field-content">
                <label>Gare d'arrivée</label>
                <input
                  type="text"
                  value={arrivalStation}
                  onChange={handleArrivalChange}
                  placeholder="Veuillez saisir au moins 2 caractères dans ce champ."
                  required
                />
                {showArrivalSuggestions && (
                  <SuggestionList
                    suggestions={arrivalSuggestions}
                    selectedIndex={arrivalSelectedIndex}
                    onSelect={(station) => handleStationSelect(station, 'arrival')}
                  />
                )}
              </div>
            </div>

            <div className="via-field">
              <button
                type="button"
                className="via-button"
                onClick={() => setShowVia(!showVia)}
              >
                <span className="material-icons">add_circle</span>
                Via
              </button>
            </div>

            {showVia && (
              <div className="field-group" ref={viaRef}>
                <span className="material-icons location-icon">place</span>
                <div className="field-content">
                  <label>Gare de passage</label>
                  <input
                    type="text"
                    value={viaStation}
                    onChange={handleViaChange}
                    placeholder="Veuillez saisir au moins 2 caractères dans ce champ."
                    required={showVia}
                  />
                  {showViaSuggestions && (
                    <SuggestionList
                      suggestions={viaSuggestions}
                      selectedIndex={viaSelectedIndex}
                      onSelect={(station) => handleStationSelect(station, 'via')}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="dates-container">
              <div className="field-group">
                <span className="material-icons calendar-icon">event</span>
                <div className="field-content">
                  <label>Aller</label>
                  <input
                    type="text"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    placeholder="jj/mm/aaaa"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => {
                      e.target.type = 'text';
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        e.target.value = format(date, 'dd/MM/yyyy');
                      }
                    }}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <span className="material-icons calendar-icon">event</span>
                <div className="field-content">
                  <label>Retour (optionnel)</label>
                  <input
                    type="text"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    placeholder="jj/mm/aaaa"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => {
                      e.target.type = 'text';
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        e.target.value = format(date, 'dd/MM/yyyy');
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="search-button">
            <span className="material-icons">search</span>
            Rechercher
          </button>
        </form>

        <style jsx>{`
          .search-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          .search-title {
            color: #000066;
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 2rem;
          }

          .search-form {
            max-width: 800px;
            margin: 0 auto;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .field-group {
            display: flex;
            align-items: flex-start;
            margin-bottom: 1.5rem;
            gap: 1rem;
            position: relative;
          }

          .location-icon, .calendar-icon {
            color: #0F8548;
            margin-top: 2rem;
          }

          .field-content {
            flex: 1;
            position: relative;
          }

          label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: #333;
          }

          input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            font-size: 1rem;
            color: #333;
            background: white;
          }

          input:focus {
            outline: none;
            border-color: #000066;
          }

          .suggestions-list {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            margin-top: 4px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
          }

          .suggestion-item {
            padding: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .suggestion-item:hover {
            background-color: #F3F4F6;
          }

          .suggestion-item .material-icons {
            font-size: 1.2rem;
            color: #0F8548;
          }

          .via-field {
            margin: 0 0 1.5rem 2.5rem;
          }

          .via-button {
            background: none;
            border: none;
            color: #000066;
            padding: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          }

          .via-button .material-icons {
            font-size: 1.2rem;
          }

          .dates-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .search-button {
            width: 100%;
            padding: 1rem;
            background: #000066;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .search-button:hover {
            background: #000044;
          }

          @media (max-width: 768px) {
            .dates-container {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
