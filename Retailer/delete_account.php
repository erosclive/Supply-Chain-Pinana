
<?php
session_start();
require 'db_connection.php';

$userId = $_SESSION['user_id'] ?? null;
$password = $_POST['password'] ?? '';

if (!$userId || empty($password)) {
    echo 'unauthorized';
    exit();
}

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    $delStmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $delStmt->bind_param("i", $userId);
    $delStmt->execute();
    session_destroy();
    echo 'success';
} else {
    echo 'invalid';
}
exit();


?>