import xlsx from 'xlsx';
import { Writable } from 'stream';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Define the headers for the Excel file. French headers are also supported (e.g., numero_train, gare_depart).
      const headers = [
        "train_number",
        "departure_station",
        "arrival_station",
        "departure_time",
        "arrival_time",
        "train_type",
        "served_stations",
        "jours_circulation"
      ];

      // Create some sample data
      const sampleData = [
        {
          train_number: "1234",
          departure_station: "Paris Gare de Lyon",
          arrival_station: "Marseille St-Charles",
          departure_time: "08:30",
          arrival_time: "12:00",
          train_type: "TGV INOUI",
          // Format 1 for served_stations: Comma-separated list of station names.
          served_stations: "Avignon TGV,Aix-en-Provence TGV",
          // Days of circulation (in English, comma-separated): Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
          jours_circulation: "Monday,Tuesday,Wednesday,Thursday,Friday"
        },
        {
            train_number: "5678",
            departure_station: "Lille Flandres",
            arrival_station: "Paris Gare du Nord",
            departure_time: "09:15",
            arrival_time: "10:15",
            train_type: "TER",
            // Format 2 for served_stations: JSON string to specify arrival/departure times for each stop.
            // Important: The JSON must be on a single line and use standard double quotes (").
            served_stations: '[{"name": "Arras", "arrivalTime": "09:40", "departureTime": "09:42"}, {"name": "Douai", "arrivalTime": "09:55", "departureTime": "09:57"}]',
            jours_circulation: "Saturday,Sunday"
        },
        {
          train_number: "4321",
          departure_station: "Bordeaux St-Jean",
          arrival_station: "Toulouse Matabiau",
          departure_time: "14:00",
          arrival_time: "16:05",
          train_type: "INTERCITÉS",
          served_stations: "Agen,Montauban-Ville-Bourbon",
          jours_circulation: "Monday,Friday,Sunday"
        }
      ];

      // Create a new workbook and a new worksheet
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(sampleData, { header: headers });

      // Append the worksheet to the workbook
      xlsx.utils.book_append_sheet(wb, ws, "Horaires");

      // Write the workbook to a buffer
      const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set the response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="exemple-horaires.xlsx"');
      
      // Send the buffer as the response
      const stream = new Writable({
        write(chunk, encoding, callback) {
          res.write(chunk, encoding);
          callback();
        }
      });

      stream.on('finish', () => {
        res.end();
      });

      stream.end(buf);

    } catch (error) {
      console.error('Error generating sample Excel file:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du fichier Excel.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
