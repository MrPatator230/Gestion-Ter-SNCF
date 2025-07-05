import { useDrop } from 'react-dnd';
import { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';

export default function CompositionDropZone({ onDrop, composition }) {
  const { primaryColor, buttonStyle } = useContext(SettingsContext);
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ROLLING_STOCK',
    drop: (item) => {
      onDrop(item);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
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
      ref={drop}
      className="drop-zone mb-4"
      style={{
        minHeight: '120px',
        border: `2px dashed ${isOver ? primaryColor : '#dee2e6'}`,
        borderRadius: getBorderRadius(),
        backgroundColor: isOver ? `${primaryColor}10` : 'transparent',
        padding: '1rem',
        transition: 'all 0.2s ease'
      }}
    >
      {composition.length === 0 ? (
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="text-center text-muted">
            <p className="mb-1">Glissez-déposez les éléments du matériel roulant ici</p>
            <small>pour créer la composition du train</small>
          </div>
        </div>
      ) : (
        <div className="d-flex align-items-center overflow-auto">
          {composition.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="composition-item me-2 flex-shrink-0"
              style={{
                width: '200px',
                borderRadius: getBorderRadius()
              }}
            >
              <div className="card h-100">
                <div className="card-body p-2">
                  <div className="d-flex flex-column align-items-center">
                    {item.imageData && (
                      <div 
                        className="mb-2" 
                        style={{ 
                          width: '80px', 
                          height: '40px',
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
                    <div className="text-center">
                      <h4 className="h6 mb-1" style={{ 
                        color: primaryColor,
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px'
                      }}>
                        {item.name}
                      </h4>
                      <p className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>{item.type}</p>
                      <button
                        onClick={() => {
                          const newComposition = [...composition];
                          newComposition.splice(index, 1);
                          onDrop(newComposition);
                        }}
                        className="btn btn-link text-danger p-0"
                        style={{ minWidth: '20px', fontSize: '0.8rem' }}
                      >
                        <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .drop-zone {
          transition: all 0.2s ease;
        }
        .card {
          border: 1px solid rgba(0,0,0,.125);
          background-color: white;
          transition: all 0.2s ease;
        }
        .card:hover {
          border-color: ${primaryColor};
          box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
        }
        .btn-link {
          text-decoration: none;
        }
        .btn-link:hover {
          opacity: 0.8;
        }
        .material-icons {
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
