import xlsx from 'xlsx';
import { Writable } from 'stream';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Define the headers for the Excel file
      const headers = [
        "name",
        "locationType",
        "categories"
      ];

      // Create some sample data
      const sampleData = [
        {
          name: "Gare de l'Est",
          locationType: "Ville",
          categories: "TGV,TER"
        },
        {
          name: "Aéroport Charles de Gaulle 2 TGV",
          locationType: "Interurbain",
          categories: "TGV,FRET"
        },
        {
            name: "Val-de-Fontenay",
            locationType: "Ville",
            categories: "TER,Autres"
        }
      ];

      // Create a new workbook and a new worksheet
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(sampleData, { header: headers });

      // Append the worksheet to the workbook
      xlsx.utils.book_append_sheet(wb, ws, "Gares");

      // Write the workbook to a buffer
      const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set the response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="exemple-gares.xlsx"');
      
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
