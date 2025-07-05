import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';

const DATA_KEYS = [
  'stations',
  'schedules',
  'trafficInfos',
  'entreprise',
  'attributionQuais',
  'materielsRoulants',
  'typeHoraires',
];

const DEFAULT_SETTINGS = {
  autoBackupEnabled: false,
  frequencyType: 'day', // 'day' or 'week'
  backupsPerPeriod: 1,
};

export default function Sauvegarde() {
  const [restoreFileName, setRestoreFileName] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(DEFAULT_SETTINGS.autoBackupEnabled);
  const [frequencyType, setFrequencyType] = useState(DEFAULT_SETTINGS.frequencyType);
  const [backupsPerPeriod, setBackupsPerPeriod] = useState(DEFAULT_SETTINGS.backupsPerPeriod);
  const [autoBackups, setAutoBackups] = useState([]);

  const backupTimerRef = useRef(null);

  // Load settings and auto backups from localStorage on mount
  useEffect(() => {
    const settings = localStorage.getItem('backupSettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setAutoBackupEnabled(parsed.autoBackupEnabled ?? DEFAULT_SETTINGS.autoBackupEnabled);
        setFrequencyType(parsed.frequencyType ?? DEFAULT_SETTINGS.frequencyType);
        setBackupsPerPeriod(parsed.backupsPerPeriod ?? DEFAULT_SETTINGS.backupsPerPeriod);
      } catch {}
    }
    const savedAutoBackups = localStorage.getItem('autoBackups');
    if (savedAutoBackups) {
      try {
        setAutoBackups(JSON.parse(savedAutoBackups));
      } catch {}
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    const settings = {
      autoBackupEnabled,
      frequencyType,
      backupsPerPeriod,
    };
    localStorage.setItem('backupSettings', JSON.stringify(settings));
  }, [autoBackupEnabled, frequencyType, backupsPerPeriod]);

  // Setup automatic backup timer
  useEffect(() => {
    if (backupTimerRef.current) {
      clearInterval(backupTimerRef.current);
      backupTimerRef.current = null;
    }
    if (autoBackupEnabled) {
      // Calculate interval in ms based on frequencyType and backupsPerPeriod
      let intervalMs = 0;
      if (frequencyType === 'day') {
        intervalMs = (24 * 60 * 60 * 1000) / backupsPerPeriod;
      } else if (frequencyType === 'week') {
        intervalMs = (7 * 24 * 60 * 60 * 1000) / backupsPerPeriod;
      }
      if (intervalMs > 0) {
        backupTimerRef.current = setInterval(() => {
          performAutoBackup();
        }, intervalMs);
      }
    }
    return () => {
      if (backupTimerRef.current) {
        clearInterval(backupTimerRef.current);
      }
    };
  }, [autoBackupEnabled, frequencyType, backupsPerPeriod]);

  const performAutoBackup = () => {
    const backupData = {};
    DATA_KEYS.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        backupData[key] = JSON.parse(data);
      }
    });
    const timestamp = new Date().toISOString();
    const newBackup = { id: timestamp, timestamp, data: backupData };
    const updatedBackups = [newBackup, ...autoBackups].slice(0, 50); // keep max 50 backups
    setAutoBackups(updatedBackups);
    localStorage.setItem('autoBackups', JSON.stringify(updatedBackups));
  };

  const handleBackup = () => {
    const backupData = {};
    DATA_KEYS.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        backupData[key] = JSON.parse(data);
      }
    });
    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e) => {
    setRestoreError('');
    const file = e.target.files[0];
    if (!file) return;
    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target.result;
        const data = JSON.parse(json);
        DATA_KEYS.forEach(key => {
          if (data[key]) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });
        alert('Restauration réussie. Veuillez recharger la page.');
      } catch (err) {
        setRestoreError('Fichier invalide ou erreur lors de la restauration.');
      }
    };
    reader.readAsText(file);
  };

  const downloadAutoBackup = (backup) => {
    const json = JSON.stringify(backup.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-backup-${backup.timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAutoBackup = (id) => {
    const updatedBackups = autoBackups.filter(b => b.id !== id);
    setAutoBackups(updatedBackups);
    localStorage.setItem('autoBackups', JSON.stringify(updatedBackups));
  };

  return (
    <div id="wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content" className="container mt-4 flex-grow-1">
          <h1>Sauvegarde et Restauration des données</h1>
          <div className="mb-4">
            <button className="btn btn-primary me-3" onClick={handleBackup}>
              Télécharger la sauvegarde
            </button>
            <label htmlFor="restoreFile" className="btn btn-secondary mb-0">
              Restaurer à partir d'un fichier JSON
              <input
                type="file"
                id="restoreFile"
                accept="application/json"
                className="d-none"
                onChange={handleRestore}
              />
            </label>
          </div>
          {restoreFileName && <p>Fichier sélectionné : {restoreFileName}</p>}
          {restoreError && <p className="text-danger">{restoreError}</p>}

          <hr />

          <h2>Paramètres de sauvegarde automatique</h2>
          <div className="mb-3 form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoBackupEnabled"
              checked={autoBackupEnabled}
              onChange={(e) => setAutoBackupEnabled(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="autoBackupEnabled">
              Activer les sauvegardes automatiques
            </label>
          </div>
          <div className="mb-3 d-flex align-items-center gap-3">
            <label htmlFor="frequencyType" className="form-label mb-0">
              Fréquence :
            </label>
            <select
              id="frequencyType"
              className="form-select w-auto"
              value={frequencyType}
              onChange={(e) => setFrequencyType(e.target.value)}
              disabled={!autoBackupEnabled}
            >
              <option value="day">Par jour</option>
              <option value="week">Par semaine</option>
            </select>
            <input
              type="number"
              min="1"
              max="24"
              className="form-control w-auto"
              style={{ maxWidth: '80px' }}
              value={backupsPerPeriod}
              onChange={(e) => setBackupsPerPeriod(Math.max(1, Math.min(24, Number(e.target.value))))}
              disabled={!autoBackupEnabled}
            />
            <span>nombre de sauvegardes</span>
          </div>

          <hr />

          <h2>Liste des sauvegardes automatiques</h2>
          {autoBackups.length === 0 ? (
            <p>Aucune sauvegarde automatique enregistrée.</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Date et heure</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {autoBackups.map(backup => (
                  <tr key={backup.id}>
                    <td>{new Date(backup.timestamp).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => downloadAutoBackup(backup)}>
                        Télécharger
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteAutoBackup(backup.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
