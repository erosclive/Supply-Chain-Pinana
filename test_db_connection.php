<?php
// Test database connection and tables
header('Content-Type: application/json');

try {
    // Include database connection
    require_once 'db_connection.php';
    
    if (!$conn) {
        throw new Exception('Database connection failed: ' . mysqli_connect_error());
    }
    
    // Test if we can query the database
    $test_query = "SHOW TABLES";
    $result = mysqli_query($conn, $test_query);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . mysqli_error($conn));
    }
    
    $tables = [];
    while ($row = mysqli_fetch_array($result)) {
        $tables[] = $row[0];
    }
    
    // Check if required tables exist
    $required_tables = ['productions', 'production_output', 'products', 'materials'];
    $missing_tables = [];
    
    foreach ($required_tables as $table) {
        if (!in_array($table, $tables)) {
            $missing_tables[] = $table;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'tables_found' => $tables,
        'missing_tables' => $missing_tables,
        'php_version' => PHP_VERSION,
        'mysql_version' => mysqli_get_server_info($conn)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_details' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}

mysqli_close($conn);
?> 