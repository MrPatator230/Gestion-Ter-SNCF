import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';

const impactTypeColors = {
  Retard: 'bg-warning text-dark',
  Suppression: 'bg-danger',
  Information: 'bg-primary',
  Modification: 'bg-info text-dark',
};

export default function InfoTrafics() {
  const [trafficInfos, setTrafficInfos] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleFolders, setScheduleFolders] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    impactType: '',
    impactedTrains: [],
    impactedFolder: null,
  });
  const [trainSearch, setTrainSearch] = useState('');
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [infosRes, schedulesRes, foldersRes] = await Promise.all([
        fetch('/api/infos-trafic'),
        fetch('/api/schedules'),
        fetch('/api/schedule-folders'),
      ]);
      if (!infosRes.ok) throw new Error('Failed to fetch infos trafic');
      if (!schedulesRes.ok) throw new Error('Failed to fetch schedules');
      if (!foldersRes.ok) throw new Error('Failed to fetch schedule folders');

      const infosData = await infosRes.json();
      const schedulesData = await schedulesRes.json();
      const foldersData = await foldersRes.json();

      setTrafficInfos(infosData);
      setSchedules(schedulesData);
      setScheduleFolders(foldersData);
      setFilteredTrains(schedulesData);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (trainSearch.trim() === '') {
      setFilteredTrains(schedules);
    } else {
      const filtered = schedules.filter(schedule =>
        schedule.trainNumber.toLowerCase().includes(trainSearch.toLowerCase())
      );
      setFilteredTrains(filtered);
    }
  }, [trainSearch, schedules]);

  const saveInfo = async (info) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (info.id) {
        if (info.impactedFolder) {
          const folderSchedules = schedules.filter(s => s.folder_id === info.impactedFolder);
          info.impactedTrains = folderSchedules.map(s => s.trainNumber);
        }
        const res = await fetch(`/api/infos-trafic/${info.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(info),
        });
        if (!res.ok) throw new Error('Failed to update info trafic');
        setSuccessMsg('Info trafic mise à jour avec succès.');
        const updatedInfo = await res.json();
        setTrafficInfos(trafficInfos.map(i => i.id === info.id ? updatedInfo : i));
      } else {
        if (info.impactedFolder) {
          const folderSchedules = schedules.filter(s => s.folder_id === info.impactedFolder);
          info.impactedTrains = folderSchedules.map(s => s.trainNumber);
        }
        const res = await fetch('/api/infos-trafic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(info),
        });
        if (!res.ok) throw new Error('Failed to create info trafic');
        setSuccessMsg('Info trafic créée avec succès.');
        const newInfo = await res.json();
        setTrafficInfos([newInfo, ...trafficInfos]);
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFolderChange = (e) => {
    const folderId = e.target.value ? parseInt(e.target.value) : null;
    setForm(prev => ({ ...prev, impactedFolder: folderId }));
    if (folderId) {
      const folderSchedules = schedules.filter(s => s.folder_id === folderId);
      setFilteredTrains(folderSchedules);
    } else {
      setFilteredTrains(schedules);
    }
  };

  const toggleTrainSelection = (trainNumber) => {
    setForm(prev => {
      const impactedTrains = prev.impactedTrains.includes(trainNumber)
        ? prev.impactedTrains.filter(t => t !== trainNumber)
        : [...prev.impactedTrains, trainNumber];
      return { ...prev, impactedTrains };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.impactType) {
      setErrorMsg('Veuillez remplir les champs obligatoires : Titre, Description, Type d\'impact.');
      return;
    }
    await saveInfo(form);
    setForm({
      id: null,
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      impactType: '',
      impactedTrains: [],
      impactedFolder: null,
    });
    setTrainSearch('');
  };

  const handleEdit = (id) => {
    const info = trafficInfos.find(info => info.id === id);
    if (info) {
      // Ensure impactedTrains is always an array to avoid undefined length error
      if (!info.impactedTrains) {
        info.impactedTrains = [];
      }
      setForm(info);
      if (info.impactedFolder) {
        const folderSchedules = schedules.filter(s => s.folder_id === info.impactedFolder);
        setFilteredTrains(folderSchedules);
      } else {
        setFilteredTrains(schedules);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer cette info trafic ?')) {
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const res = await fetch(`/api/infos-trafic/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete info trafic');
        setSuccessMsg('Info trafic supprimée avec succès.');
        setTrafficInfos(trafficInfos.filter(info => info.id !== id));
      } catch (error) {
        setErrorMsg(error.message);
      }
    }
  };

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content" className="container my-5 flex-grow-1">
          <h1 className="mb-4 text-center">Gestion des Infos Trafic</h1>

          {loading && <div className="alert alert-info">Chargement des données...</div>}
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="mb-5" noValidate>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Titre *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleInputChange}
                required
                aria-required="true"
              />
            </div>
            <div className="mb-3 d-flex gap-3">
              <div className="flex-grow-1">
                <label htmlFor="startDate" className="form-label">De (optionnel)</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-control"
                  value={form.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-grow-1">
                <label htmlFor="endDate" className="form-label">À (optionnel)</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-control"
                  value={form.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="3"
                value={form.description}
                onChange={handleInputChange}
                required
                aria-required="true"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="impactType" className="form-label">Type d'impact sur le réseau *</label>
              <select
                id="impactType"
                name="impactType"
                className="form-select"
                value={form.impactType}
                onChange={handleInputChange}
                required
                aria-required="true"
              >
                <option value="">-- Sélectionnez un type --</option>
                <option value="Retard">Retard</option>
                <option value="Suppression">Suppression</option>
                <option value="Modification">Modification</option>
                <option value="Information">Information</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="folderSelect" className="form-label">Appliquer à un dossier d'horaires</label>
              <select
                id="folderSelect"
                name="folderSelect"
                className="form-select"
                value={form.impactedFolder || ''}
                onChange={handleFolderChange}
              >
                <option value="">-- Aucun dossier sélectionné --</option>
                {scheduleFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="trainSearch" className="form-label">Horaires impactés (rechercher un numéro de train)</label>
              <input
                type="text"
                id="trainSearch"
                className="form-control"
                placeholder="Rechercher un numéro de train"
                value={trainSearch}
                onChange={(e) => setTrainSearch(e.target.value)}
              />
              <div className="mt-2" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', borderRadius: '0.25rem' }}>
                {filteredTrains.length === 0 && <p className="text-muted p-2">Aucun train trouvé.</p>}
                {filteredTrains.map(schedule => (
                  <div key={schedule.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`train-${schedule.id}`}
                      checked={form.impactedTrains.includes(schedule.trainNumber)}
                      onChange={() => toggleTrainSelection(schedule.trainNumber)}
                    />
                    <label className="form-check-label" htmlFor={`train-${schedule.id}`}>
                      {schedule.trainNumber} - {schedule.departureStation} &rarr; {schedule.arrivalStation}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {form.id === null ? 'Créer' : 'Mettre à jour'}
            </button>
          </form>

          <h2 className="mb-3">Infos Trafic existantes</h2>
          {trafficInfos.length === 0 ? (
            <p>Aucune info trafic enregistrée.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Titre</th>
                    <th>De quand à quand</th>
                    <th>Description</th>
                    <th>Type d'impact</th>
                    <th>Horaires impactés</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trafficInfos.map(info => (
                    <tr key={info.id}>
                      <td>{info.title}</td>
                      <td>{info.startDate || '-'} {info.endDate ? `à ${info.endDate}` : ''}</td>
                      <td>{info.description}</td>
                      <td>
                        <span className={`badge ${impactTypeColors[info.impactType] || 'bg-secondary'}`}>
                          {info.impactType}
                        </span>
                      </td>
                      <td>
                      {!info.impactedTrains || info.impactedTrains.length === 0 ? '-' : info.impactedTrains.join(', ')}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(info.id)}>Modifier</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(info.id)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
