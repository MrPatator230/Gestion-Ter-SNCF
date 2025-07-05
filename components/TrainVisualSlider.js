import { useState, useEffect, useCallback } from 'react';

export default function TrainVisualSlider({ trainNumber, composition, visualHeight = 300 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    if (composition?.length > 1) {
      setCurrentIndex(current => (current + 1) % composition.length);
    }
  }, [composition?.length]);

  useEffect(() => {
    let intervalId;
    if (isAutoPlaying && composition?.length > 1) {
      intervalId = setInterval(nextSlide, 3000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, nextSlide, composition?.length]);

  const handlePrevClick = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(current => 
      current === 0 ? composition.length - 1 : current - 1
    );
  };

  const handleNextClick = () => {
    setIsAutoPlaying(false);
    nextSlide();
  };

  if (!composition || composition.length === 0) {
    return (
      <div className="train-visual-placeholder" style={{ height: visualHeight }}>
        <span className="material-icons">train</span>
        <p>Composition non définie pour le train {trainNumber}</p>
      </div>
    );
  }

  return (
    <div className="train-visual-slider">
      <div className="train-visual-container">
        {composition.length > 1 && (
          <button 
            className="nav-arrow prev"
            onClick={handlePrevClick}
          >
            ←
          </button>
        )}

        <div className="train-visual-wrapper">
          <div 
            className="train-composition"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / composition.length)}%)`,
              width: `${composition.length * 100}%`
            }}
          >
            {composition.map((materiel, index) => (
              <div key={index} className="train-unit">
                <img 
                  src={materiel.imageData} 
                  alt={`Train ${trainNumber} - Unité ${index + 1}`}
                  className="train-visual-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/train-placeholder.png';
                  }}
                />
                <div className="train-info-overlay">
                  <div className="train-name">Train {trainNumber} - Unité {index + 1}</div>
                  <div className="materiel-info">
                    <span className="materiel-name">{materiel.name}</span>
                    <span className="materiel-type">{materiel.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {composition.length > 1 && (
          <button 
            className="nav-arrow next"
            onClick={handleNextClick}
          >
            →
          </button>
        )}

        {composition.length > 1 && (
          <div className="slider-indicators">
            {composition.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .train-visual-slider {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
        }

        .train-visual-container {
          position: relative;
          width: 100%;
          height: ${visualHeight}px;
          display: flex;
          align-items: center;
        }

        .train-visual-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .train-composition {
          display: flex;
          height: 100%;
          transition: transform 0.5s ease;
        }

        .train-unit {
          position: relative;
          flex: 0 0 ${100 / composition.length}%;
          width: ${100 / composition.length}%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .train-visual-image {
          height: 80%;
          width: auto;
          max-width: 90%;
          object-fit: contain;
        }

        .train-info-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 102, 0.8);
          color: white;
          padding: 0.75rem;
        }

        .train-name {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .materiel-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          background: none;
          border: none;
          color: black;
          font-size: 24px;
          cursor: pointer;
          padding: 10px;
          transition: opacity 0.2s;
        }

        .nav-arrow:hover {
          opacity: 0.7;
        }

        .nav-arrow.prev {
          left: 0;
        }

        .nav-arrow.next {
          right: 0;
        }

        .slider-indicators {
          position: absolute;
          bottom: 60px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 8px;
          z-index: 3;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .indicator.active {
          background: white;
          transform: scale(1.2);
        }

        .train-visual-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 8px;
          color: #666;
        }

        .train-visual-placeholder .material-icons {
          font-size: 48px;
          margin-bottom: 1rem;
          color: #000066;
        }

        @media (max-width: 768px) {
          .nav-button {
            width: 32px;
            height: 32px;
          }

          .train-info-overlay {
            padding: 0.5rem;
          }

          .train-name {
            font-size: 1rem;
          }

          .materiel-info {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
