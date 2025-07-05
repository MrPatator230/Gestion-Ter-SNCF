import { motion } from 'framer-motion';

export default function RecentStats({ stats, primaryColor }) {
  return (
    <div className="h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Statistiques Récentes</h5>
        <div className="dropdown">
          <button 
            className="btn btn-link p-0" 
            type="button" 
            data-bs-toggle="dropdown"
            style={{ color: primaryColor }}
          >
            <span className="material-icons">more_vert</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item">Aujourd'hui</button></li>
            <li><button className="dropdown-item">Cette semaine</button></li>
            <li><button className="dropdown-item">Ce mois</button></li>
          </ul>
        </div>
      </div>
      <div className="row g-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-3 bg-white shadow-sm h-100"
              style={{ border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: `${primaryColor}15`,
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <span 
                    className="material-icons"
                    style={{ color: primaryColor, fontSize: '1.25rem' }}
                  >
                    {stat.icon}
                  </span>
                </div>
                <h6 className="mb-0 text-muted">{stat.title}</h6>
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <div className="h3 mb-0 fw-bold">{stat.value}</div>
                  {stat.subtitle && (
                    <div className="text-muted small mt-1">{stat.subtitle}</div>
                  )}
                </div>
                {stat.change && (
                  <div 
                    className={`small d-flex align-items-center ${
                      stat.change > 0 ? 'text-success' : 'text-danger'
                    }`}
                  >
                    <span className="material-icons me-1" style={{ fontSize: '1rem' }}>
                      {stat.change > 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .dropdown-item:hover {
          background-color: ${primaryColor}15;
          color: ${primaryColor};
        }
      `}</style>
    </div>
  );
}
