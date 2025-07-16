const xlsx = require('xlsx');

const data = [
  {
    numero_train: "12345",
    gare_depart: "Paris Gare de Lyon",
    gare_arrivee: "Lyon Part-Dieu",
    heure_depart: "08:00",
    heure_arrivee: "10:00",
    type_train: "TGV",
    jours_circulation: "Monday,Tuesday,Wednesday,Thursday,Friday",
    gares_desservies: "[]"
  },
  {
    numero_train: "67890",
    gare_depart: "Marseille St-Charles",
    gare_arrivee: "Nice-Ville",
    heure_depart: "09:30",
    heure_arrivee: "12:00",
    type_train: "TER",
    jours_circulation: "Saturday,Sunday",
    gares_desservies: '["Toulon", "Cannes"]'
  }
];

const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Horaires");

xlsx.writeFile(workbook, "test-horaires.xlsx");

console.log("test-horaires.xlsx created successfully.");
