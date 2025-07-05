import { motion } from 'framer-motion';

export default function DashboardWidget({ title, value, icon, color = '#007bff', onClick }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer w-100"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted small text-uppercase mb-1">{title}</div>
            <div className="h3 mb-0 fw-bold">{value}</div>
          </div>
          <div 
            className="rounded-circle p-3 d-flex align-items-center justify-content-center"
            style={{ 
              backgroundColor: color,
              width: '60px',
              height: '60px'
            }}
          >
            <span className="material-icons text-white" style={{ fontSize: '2rem' }}>
              {icon}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </motion.div>
  );
}
