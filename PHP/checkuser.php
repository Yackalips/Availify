<?php
function sanitize_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? sanitize_input($_POST['username']) : '';
    $password = isset($_POST['password']) ? sanitize_input($_POST['password']) : '';

    $fileContents = file_get_contents("data/users.txt");
    if (strpos($fileContents, $username.":".$password) !== false) {
        echo json_encode(true);
    }
    else {
        echo json_encode(false);
    }
} 
else {
    echo "error";
}
?>
