<?php

header('Content-Type: application/json');

function sanitize_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = isset($_POST['user']) ? sanitize_input($_POST['user']) : '';

    if (empty($user)) {
        echo json_encode(['error' => 'User not specified']);
        exit;
    }

    $filePath = 'data/heatmapdata.txt';

    if (!file_exists($filePath)) {
        echo json_encode(['error' => 'Data file not found']);
        exit;
    }

    $fileContents = file_get_contents($filePath);

    $userPattern = '/^' . preg_quote($user, '/') . '\{\s*(.*?)\s*\}$/ms';

    if (preg_match($userPattern, $fileContents, $matches)) {
       
        $dataBlock = $matches[1];

        // even more annoying parsing stuff
        $lines = explode("\n", $dataBlock);
        $dataArray = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            $parts = explode(':', $line, 2);
            if (count($parts) == 2) {
                $key = trim($parts[0]);
                $value = trim($parts[1]);
                $dataArray[$key] = $value;
            }
        }

        echo json_encode($dataArray);
    } else {
        echo json_encode(['error' => 'User data not found']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
