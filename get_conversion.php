<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

$from_unit = $_GET['from'] ?? '';
$to_unit = $_GET['to'] ?? '';

if (empty($from_unit) || empty($to_unit)) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

// Direct conversion
$sql = "SELECT conversion_factor FROM measurement_conversions WHERE from_unit = ? AND to_unit = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'ss', $from_unit, $to_unit);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode(['success' => true, 'conversion_factor' => $row['conversion_factor']]);
} else {
    // Try reverse conversion
    $sql = "SELECT (1/conversion_factor) as conversion_factor FROM measurement_conversions WHERE from_unit = ? AND to_unit = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ss', $to_unit, $from_unit);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode(['success' => true, 'conversion_factor' => $row['conversion_factor']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Conversion not found']);
    }
}
?>