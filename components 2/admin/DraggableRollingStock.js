import { useDrag } from 'react-dnd';
import { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';

export default function DraggableRollingStock({ item, onEdit, onDelete }) {
  const { primaryColor, buttonStyle } = useContext(SettingsContext);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ROLLING_STOCK',
    item: { ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getBorderRadius = () => {
    switch (buttonStyle) {
      case 'rounded':
        return '25px';
      case 'square':
        return '0';
      default:
        return '4px';
    }
  };

  return (
    <div
      ref={drag}
      className="card mb-3"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        borderRadius: getBorderRadius(),
        transition: 'all 0.2s ease'
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            {item.imageData && (
              <div 
                className="me-3" 
                style={{ 
                  width: '64px', 
                  height: '64px',
                  flexShrink: 0
                }}
              >
                <img 
                  src={item.imageData} 
                  alt={item.name} 
                  className="w-100 h-100"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <div>
              <h3 className="h6 mb-1" style={{ color: primaryColor }}>{item.name}</h3>
              <p className="text-muted small mb-0">{item.type}</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={onEdit}
              className="btn btn-outline-warning btn-sm"
              style={{ borderRadius: getBorderRadius() }}
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="btn btn-outline-danger btn-sm"
              style={{ borderRadius: getBorderRadius() }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: 1px solid rgba(0,0,0,.125);
          background-color: white;
        }
        .card:hover {
          border-color: ${primaryColor};
          box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
