import React from 'react';
import { QRCode } from 'react-qr-code';

export default function QRCodeTicket({ ticketId }) {
  if (!ticketId) {
    return <div>QR Code non disponible</div>;
  }

  // Générer une valeur unique pour le QR Code en combinant ticketId et timestamp
  const qrValue = `ticket:${ticketId}:${Date.now()}`;

  return (
    <div style={{ marginTop: '1rem' }}>
      <QRCode value={qrValue} size={128} />
    </div>
  );
}
