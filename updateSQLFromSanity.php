<?php
// updateSQLFromSanity.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

// Parse incoming JSON
$payload = file_get_contents("php://input");
$data = json_decode($payload, true);

if (!$data) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid JSON"]);
  exit;
}

// 🔍 Debug log to file (optional, remove in production)
file_put_contents("debug.log", print_r($data, true));

// 🔒 Optional: validate a secret (set this in Sanity webhook and here)
$SANITY_SECRET = "pinyahanCAPSTONEprthesisGroup4";
if (!isset($_GET['secret']) || $_GET['secret'] !== $SANITY_SECRET) {
  http_response_code(403);
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

include("db_connection.php");

// Extract slug and stock from the Sanity webhook payload
// Adjust these based on your exact webhook structure
$slug = isset($data['slug']['current']) ? $conn->real_escape_string($data['slug']['current']) : null;
$stock = isset($data['stock']) ? (int)$data['stock'] : null;

if (!$slug || $stock === null) {
  http_response_code(400);
  echo json_encode(["error" => "Missing slug or stock in payload"]);
  exit;
}

// Update your SQL database
$sql = "UPDATE products SET stocks = $stock WHERE slug = '$slug'";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["success" => true, "slug" => $slug, "stock" => $stock]);
} else {
  http_response_code(500);
  echo json_encode(["error" => $conn->error]);
}

$conn->close();
?>
