import { motion } from 'framer-motion';

export default function ActivityFeed({ activities, primaryColor }) {
  return (
    <div className="h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Activités Récentes</h5>
        <button 
          className="btn btn-link p-0" 
          type="button"
          style={{ color: primaryColor }}
        >
          <span className="material-icons">refresh</span>
        </button>
      </div>

      <div className="activity-timeline">
        {activities.map((activity, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="activity-item position-relative mb-4 ps-4"
          >
            <div 
              className="activity-icon position-absolute start-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                backgroundColor: `${primaryColor}15`,
                width: '32px',
                height: '32px',
                top: '0'
              }}
            >
              <span 
                className="material-icons"
                style={{ 
                  color: primaryColor,
                  fontSize: '1rem'
                }}
              >
                {activity.icon}
              </span>
            </div>

            <div className="activity-content">
              <h6 className="mb-1 fs-6 fw-semibold">{activity.title}</h6>
              <p className="mb-1 text-muted small">{activity.description}</p>
              <small 
                className="text-muted d-block"
                style={{ fontSize: '0.75rem' }}
              >
                {activity.time}
              </small>
            </div>

            {index < activities.length - 1 && (
              <div 
                className="activity-line position-absolute"
                style={{
                  width: '2px',
                  backgroundColor: `${primaryColor}15`,
                  left: '15px',
                  top: '32px',
                  bottom: '-24px'
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .activity-timeline {
          position: relative;
          padding-bottom: 1rem;
        }

        .activity-item {
          position: relative;
        }

        .activity-content {
          background-color: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid rgba(0,0,0,0.05);
          margin-left: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .activity-icon {
          z-index: 1;
          background-color: white;
        }
      `}</style>
    </div>
  );
}
