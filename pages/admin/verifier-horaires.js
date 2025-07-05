import { useState } from 'react';
import Layout from '../../components/Layout';
import ScheduleSearchForm from '../../components/admin/ScheduleSearchForm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function VerifierHoraires() {
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = (searchData) => {
    // Simuler une recherche d'horaires
    // Dans un cas réel, cela ferait un appel API
    console.log('Recherche avec les paramètres:', searchData);
    
    // Simuler des résultats
    const mockResults = {
      aller: {
        date: searchData.departureDate,
        trains: [
          {
            id: 1,
            departure: '08:00',
            arrival: '09:30',
            duration: '1h30',
            type: 'TER',
            number: '857412',
            status: 'À l\'heure'
          },
          {
            id: 2,
            departure: '10:00',
            arrival: '11:30',
            duration: '1h30',
            type: 'TER',
            number: '857413',
            status: 'À l\'heure'
          }
        ]
      },
      retour: searchData.returnDate ? {
        date: searchData.returnDate,
        trains: [
          {
            id: 3,
            departure: '16:00',
            arrival: '17:30',
            duration: '1h30',
            type: 'TER',
            number: '857414',
            status: 'À l\'heure'
          }
        ]
      } : null
    };

    setSearchResults(mockResults);
  };

  const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'EEEE d MMMM yyyy', { locale: fr });
  };

  return (
    <Layout>
      <div className="d-flex align-items-center bg-white p-3 shadow-sm mb-4">
        <h1 className="sncf-title mb-0">Vérification des Horaires</h1>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <ScheduleSearchForm onSearch={handleSearch} />
          </div>
        </div>

        {searchResults && (
          <div className="row mt-4">
            <div className="col-12">
              {/* Résultats Aller */}
              <div className="sncf-card mb-4">
                <div className="sncf-card-header">
                  <h5 className="mb-0">
                    Trains disponibles le {formatDate(searchResults.aller.date)}
                  </h5>
                </div>
                <div className="sncf-card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>N° Train</th>
                          <th>Départ</th>
                          <th>Arrivée</th>
                          <th>Durée</th>
                          <th>Type</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.aller.trains.map((train) => (
                          <tr key={train.id}>
                            <td>{train.number}</td>
                            <td>{train.departure}</td>
                            <td>{train.arrival}</td>
                            <td>{train.duration}</td>
                            <td>{train.type}</td>
                            <td>
                              <span className="badge bg-success">
                                {train.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Résultats Retour */}
              {searchResults.retour && (
                <div className="sncf-card">
                  <div className="sncf-card-header">
                    <h5 className="mb-0">
                      Trains disponibles le {formatDate(searchResults.retour.date)}
                    </h5>
                  </div>
                  <div className="sncf-card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>N° Train</th>
                            <th>Départ</th>
                            <th>Arrivée</th>
                            <th>Durée</th>
                            <th>Type</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.retour.trains.map((train) => (
                            <tr key={train.id}>
                              <td>{train.number}</td>
                              <td>{train.departure}</td>
                              <td>{train.arrival}</td>
                              <td>{train.duration}</td>
                              <td>{train.type}</td>
                              <td>
                                <span className="badge bg-success">
                                  {train.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
