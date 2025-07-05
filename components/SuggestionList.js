import React from 'react';

export default function SuggestionList({ suggestions, selectedIndex, onSelect }) {
  return (
    <div className="suggestions-list">
      {suggestions.map((station, index) => (
        <div
          key={index}
          className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(station)}
        >
          <span className="material-icons">refresh</span>
          {station}
        </div>
      ))}

      <style jsx>{`
        .suggestions-list {
          border: 1px solid #0f8548;
          border-radius: 4px;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-height: 200px;
          overflow-y: auto;
          margin-top: 4px;
          z-index: 1000;
          position: absolute;
          width: 100%;
        }
        .suggestion-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #0f8548;
          color: #0f8548;
        }
        .suggestion-item:last-child {
          border-bottom: none;
        }
        .suggestion-item.selected {
          background-color: #d4edda;
          font-weight: 600;
          border: 1px solid #0f8548;
          border-radius: 4px;
        }
        .suggestion-item:hover {
          background-color: #d4edda;
        }
        .material-icons {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
