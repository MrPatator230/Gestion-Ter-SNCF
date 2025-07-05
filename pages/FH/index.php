<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Choix de fichier PDF</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-6">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Choisissez un fichier PDF</h1>
        <form method="GET" action="" class="space-y-4">
            <label for="pdfFile" class="block text-gray-700 font-semibold mb-2">Fichiers disponibles :</label>
            <select id="pdfFile" name="pdfFile" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <?php
                $jsonFile = __DIR__ . '/pdf_files.json';
                $files = [];
                if (file_exists($jsonFile)) {
                    $jsonContent = file_get_contents($jsonFile);
                    $files = json_decode($jsonContent, true);
                }
                foreach ($files as $file) {
                    echo '<option value="' . htmlspecialchars($file['file']) . '">' . htmlspecialchars($file['name']) . '</option>';
                }
                ?>
            </select>
            <button type="submit" class="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition">Afficher</button>
        </form>
        <?php
        if (isset($_GET['pdfFile'])) {
            $selectedFile = basename($_GET['pdfFile']);
            $filePath = __DIR__ . '/src/FH/' . $selectedFile;
            if (file_exists($filePath)) {
                echo '<div class="mt-6">';
                echo '<h2 class="text-xl font-semibold mb-2 text-gray-800">Fichier sélectionné :</h2>';
                echo '<a href="src/FH/' . htmlspecialchars($selectedFile) . '" target="_blank" class="text-blue-600 hover:underline">Ouvrir le PDF dans un nouvel onglet</a>';
                echo '</div>';
            } else {
                echo '<p class="mt-6 text-red-600 font-semibold">Fichier non trouvé.</p>';
            }
        }
        ?>
    </div>
</body>
</html>
