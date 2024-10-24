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

    $filePath = 'data/heatmapcelldata.txt';

    if (!file_exists($filePath)) {
        echo json_encode(['error' => 'Data file not found']);
        exit;
    }

    $fileContents = file_get_contents($filePath);

    $userPattern = '/^'.preg_quote($user, '/').'\{\s*(.*?)\s*\}$/ms';

    //parsing stuff ._.
    if (preg_match($userPattern, $fileContents, $matches)) {
        $dataBlock = $matches[1];

        $lines = explode("\n", $dataBlock);
        $cellData = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            $parts = explode(':', $line, 2);
            if (count($parts) == 2) {
                $cellId = trim($parts[0]);
                $count = intval(trim($parts[1]));
                $cellData[$cellId] = $count;
            }
        }


        echo json_encode(['cellData' => $cellData]);
    } else {
        echo json_encode(['error' => 'User data not found']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
