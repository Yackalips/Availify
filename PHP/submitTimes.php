<?php

header('Content-Type: application/json');

function sanitize_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = isset($_POST['user']) ? sanitize_input($_POST['user']) : '';
    $cellIds = isset($_POST['cellIds']) ? $_POST['cellIds'] : '';

    if (empty($user) || empty($cellIds)) {
        echo json_encode(['error' => 'User or cell IDs not specified']);
        exit;
    }

    $cellIdsArray = json_decode($cellIds, true);

    if (!is_array($cellIdsArray)) {
        echo json_encode(['error' => 'Invalid cell IDs format']);
        exit;
    }

    $filePath = 'data/heatmapcelldata.txt';

    $dataArray = [];

    $fileHandle = fopen($filePath, 'c+');

    if ($fileHandle) {
        if (flock($fileHandle, LOCK_EX)) {
            $fileContents = stream_get_contents($fileHandle);
            rewind($fileHandle); 

            $userPattern = '/^'.preg_quote($user, '/').'\{\s*(.*?)\s*\}$/ms';

            if (preg_match($userPattern, $fileContents, $matches)) {
                $dataBlock = $matches[1];

                $lines = explode("\n", $dataBlock);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line)) continue;
                    $parts = explode(':', $line, 2);
                    if (count($parts) == 2) {
                        $key = trim($parts[0]);
                        $value = trim($parts[1]);
                        $dataArray[$key] = intval($value);
                    }
                }
            }

            foreach ($cellIdsArray as $cellId) {
                if (isset($dataArray[$cellId])) {
                    $dataArray[$cellId] += 1;
                } else {
                    $dataArray[$cellId] = 1;
                }
            }

            $newUserData = $user . "{\n";
            foreach ($dataArray as $key => $value) {
                $newUserData .= $key . ':' . $value . "\n";
            }
            $newUserData .= "}\n";

            if (preg_match($userPattern, $fileContents)) {
                $fileContents = preg_replace($userPattern, $newUserData, $fileContents);
            } else {
                $fileContents .= $newUserData;
            }

            ftruncate($fileHandle, 0);
            rewind($fileHandle);
            fwrite($fileHandle, $fileContents);

            flock($fileHandle, LOCK_UN);
            fclose($fileHandle);

            echo json_encode(['success' => true]);
        } else {
            fclose($fileHandle);
            echo json_encode(['error' => 'Could not lock the data file']);
        }
    } else {
        echo json_encode(['error' => 'Could not open the data file']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
