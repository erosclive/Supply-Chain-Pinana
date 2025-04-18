<?php
// Include database connection
require_once 'connection_db.php';

// Create users table if it doesn't exist
$create_table_sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1
)";

if (mysqli_query($conn, $create_table_sql)) {
    echo "Users table created successfully.<br>";
} else {
    echo "Error creating users table: " . mysqli_error($conn) . "<br>";
    exit();
}

// Check if admin user already exists
$check_admin_sql = "SELECT id FROM users WHERE username = 'owneradmin'";
$result = mysqli_query($conn, $check_admin_sql);

if (mysqli_num_rows($result) == 0) {
    // Admin user doesn't exist, create it
    $username = "owneradmin";
    $password = "ownerpassword";
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $role = "admin";
    $email = "admin@pinana.com";
    $full_name = "Admin User";
    
    $insert_admin_sql = "INSERT INTO users (username, password, role, email, full_name) 
                         VALUES (?, ?, ?, ?, ?)";
    
    $stmt = mysqli_prepare($conn, $insert_admin_sql);
    mysqli_stmt_bind_param($stmt, "sssss", $username, $hashed_password, $role, $email, $full_name);
    
    if (mysqli_stmt_execute($stmt)) {
        echo "Admin user created successfully.<br>";
    } else {
        echo "Error creating admin user: " . mysqli_error($conn) . "<br>";
    }
    
    mysqli_stmt_close($stmt);
} else {
    echo "Admin user already exists.<br>";
}

// Close database connection
mysqli_close($conn);

echo "Setup completed.";
?>