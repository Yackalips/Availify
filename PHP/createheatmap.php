<?php
function sanitize_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstMonthDate = isset($_POST['firstMonthDate']) ? sanitize_input($_POST['firstMonthDate']) : '';
    $firstDayDate   = isset($_POST['firstDayDate']) ? sanitize_input($_POST['firstDayDate']) : '';
    $length         = isset($_POST['length']) ? sanitize_input($_POST['length']) : '';
    $firstDay       = isset($_POST['firstDay']) ? sanitize_input($_POST['firstDay']) : '';
    $user           = isset($_POST['user']) ? sanitize_input($_POST['user']) : '';

    $newUserData = $user."{\n";
    $newUserData .= "firstMonthDate:".$firstMonthDate."\n";
    $newUserData .= "firstDayDate:".$firstDayDate."\n";
    $newUserData .= "length:".$length."\n";
    $newUserData .= "firstDay:".$firstDay."\n";
    $newUserData .= "}\n";

    $filePath = 'data/heatmapdata.txt';

    if (file_exists($filePath)) {
        $fileContents = file_get_contents($filePath);
    } 
    else {
        $fileContents = '';
    }

    $userPattern = '/^'.preg_quote($user, '/').'\{.*?\}(\n|$)/ms';

    if (preg_match($userPattern, $fileContents)) {
        $fileContents = preg_replace($userPattern, $newUserData, $fileContents);
    }
    else {
        $fileContents .= $newUserData;
    }

    file_put_contents($filePath, $fileContents);

    echo json_encode(true);
} else {
    echo json_encode(false);
}
?>
