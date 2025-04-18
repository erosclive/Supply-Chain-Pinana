<?php
// Database configuration
$host = "localhost";
$username = "root";  // Your database username
$password = "";      // Your database password
$database = "supplychain_db";  // Updated to match your database name

// Create connection
$conn = mysqli_connect($host, $username, $password, $database);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Set charset to utf8mb4
mysqli_set_charset($conn, "utf8mb4");
?>