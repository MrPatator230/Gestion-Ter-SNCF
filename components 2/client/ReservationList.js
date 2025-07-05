export default function ReservationList({ reservations, isPast, onCancel }) {
  return (
    <div className="reservation-list">
      {reservations.length === 0 ? (
        <div className="alert alert-warning">
          <span className="alert-icon">
            <i className="icons-information icons-size-1x5" aria-hidden="true"></i>
          </span>
          <p className="mb-0">
            {isPast ? "Vous n'avez aucune réservation passée." : "Vous n'avez aucune réservation à venir."}
          </p>
        </div>
      ) : (
        <div className="list-group">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge badge-primary mr-2">{reservation.category}</span>
                    <h5 className="mb-0">{reservation.typeName}</h5>
                  </div>
                  <div className="text-muted">
                    <i className="icons-calendar-ticket icons-size-1x25 mr-2" aria-hidden="true"></i>
                    {new Date(reservation.date).toLocaleString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-primary font-weight-bold mt-2">
                    <i className="icons-ticket icons-size-1x25 mr-2" aria-hidden="true"></i>
                    {reservation.price} €
                  </div>
                </div>
                {!isPast && (
                  <button
                    onClick={() => onCancel(reservation.id)}
                    className="btn btn-only-icon btn-danger"
                    title="Annuler la réservation"
                  >
                    <i className="icons-close icons-size-1x75" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .reservation-list {
          margin-bottom: 2rem;
        }

        .list-group-item {
          border-left: 4px solid #00a1e5;
          margin-bottom: 1rem;
          transition: all 0.2s ease;
        }

        .list-group-item:hover {
          background-color: #f8f9fa;
        }

        .badge-primary {
          background-color: #00a1e5;
          font-size: 0.875rem;
          padding: 0.5em 0.75em;
        }

        .btn-only-icon {
          width: 44px;
          height: 44px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .alert {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: 4px;
        }

        .alert-icon {
          margin-right: 1rem;
          color: #856404;
        }

        .alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
        }
      `}</style>
    </div>
  );
}
