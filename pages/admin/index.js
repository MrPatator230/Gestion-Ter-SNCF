import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { AuthContext } from '../../src/contexts/AuthContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import Sidebar from '../../components/Sidebar';
import MobileMenuToggle from '../../components/MobileMenuToggle';
import DashboardWidget from '../../components/admin/DashboardWidget';
import RecentStats from '../../components/admin/RecentStats';
import ActivityFeed from '../../components/admin/ActivityFeed';
import styles from '../../styles/operatorColors.module.css';

export default function Admin() {
  const { isAuthenticated } = useContext(AuthContext);
  const { 
    logoUrl, 
    appName, 
    companyName,
    primaryColor,
    secondaryColor,
    buttonStyle 
  } = useContext(SettingsContext);

  const router = useRouter();
  const [stationCount, setStationCount] = useState(0);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [onTimeRatio, setOnTimeRatio] = useState(null);
  const [activities, setActivities] = useState([]);

  const getThemeClass = (logoUrl) => {
    if (!logoUrl) return '';
    const region = logoUrl.split('logo-ter-')[1]?.split('.')[0];
    if (!region) return '';
    return styles[`${region}Theme`];
  };

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setStationCount(data.stationCount);
        setScheduleCount(data.scheduleCount);
        setOnTimeRatio(data.onTimeRatio);
        setActivities(data.activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }
    fetchDashboardData();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Trafic Journalier',
      value: '2,547',
      icon: 'trending_up',
      color: 'success',
      change: 12,
      subtitle: 'Trains en circulation aujourd\'hui'
    },
    {
      title: 'Ponctualité',
      value: '96%',
      icon: 'timer',
      color: 'primary',
      change: 3,
      subtitle: 'Moyenne sur les 30 derniers jours'
    },
    {
      title: 'Annonces Diffusées',
      value: '1,286',
      icon: 'campaign',
      color: 'info',
      change: 8,
      subtitle: 'Dernières 24 heures'
    },
    {
      title: 'Alertes Actives',
      value: '3',
      icon: 'warning',
      color: 'warning',
      change: -25,
      subtitle: 'Perturbations en cours'
    }
  ];

  return (
     <div className={`app-container ${getThemeClass(logoUrl)}`}>
      <Sidebar/>
       <div className="d-flex">        
        <main className="flex-grow-1 min-vh-100 bg-light">
          {/* Header */}
          <header className="bg-white shadow-sm mb-4 px-4 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <MobileMenuToggle />
                <h1 className="h3 mb-0 ms-3">Tableau de bord</h1>
              </div>
              <div className="d-flex align-items-center">
                <Image
                  src={logoUrl || '/images/sncf-logo.png'}
                  alt={appName || 'SNCF'}
                  width={120}
                  height={40}
                  className="me-3"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="container-fluid px-4">
            {/* Quick Stats */}
            <div className="row g-4 mb-4">
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{
                  borderRadius: buttonStyle === 'rounded' ? '15px' : '4px'
                }}>
                  <div className="card-body">
                    <DashboardWidget
                      title="Nombre de gares"
                      value={stationCount}
                      icon="train"
                      color={primaryColor}
                      onClick={() => router.push('/stations')}
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{
                  borderRadius: buttonStyle === 'rounded' ? '15px' : '4px'
                }}>
                  <div className="card-body">
                    <DashboardWidget
                      title="Horaires créés"
                      value={scheduleCount}
                      icon="schedule"
                      color={primaryColor}
                      onClick={() => router.push('/admin/horaires')}
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{
                  borderRadius: buttonStyle === 'rounded' ? '15px' : '4px'
                }}>
                  <div className="card-body">
                    <DashboardWidget
                      title="Ratio de ponctualité"
                      value={`${onTimeRatio || 0}%`}
                      icon="verified"
                      color={primaryColor}
                    />
                  </div>
                </div>
              </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{
                borderRadius: buttonStyle === 'rounded' ? '15px' : '4px'
              }}>
                <div className="card-body">
                  <DashboardWidget
                    title="Système d'annonces"
                    value="Accéder"
                    icon="campaign"
                    color={primaryColor}
                    onClick={() => router.push('/admin/banque-de-sons')}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{
                borderRadius: buttonStyle === 'rounded' ? '15px' : '4px'
              }}>
                <div className="card-body">
                  <DashboardWidget
                    title="Affichage Voyageurs"
                    value="Accéder"
                    icon="schedule"
                    color={primaryColor}
                    onClick={() => router.push('/admin/affichage-voyageurs')}
                  />
                </div>
              </div>
            </div>
            </div>

            {/* Stats and Activity Feed */}
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm" style={{
                  borderRadius: buttonStyle === 'rounded' ? '15px' : '4px'
                }}>
                  <div className="card-body">
                    <RecentStats stats={stats} primaryColor={primaryColor} />
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm" style={{
                  borderRadius: buttonStyle === 'rounded' ? '15px' : '4px'
                }}>
                  <div className="card-body">
                    <ActivityFeed activities={activities} primaryColor={primaryColor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        
        .card {
          transition: transform 0.2s;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }

        :global(.nav-link) {
          color: ${secondaryColor};
        }

        :global(.nav-link.active) {
          color: ${primaryColor};
        }

        :global(.btn-primary) {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
        }

        :global(.text-primary) {
          color: ${primaryColor} !important;
        }
      `}</style>
    </div>
  );
}
