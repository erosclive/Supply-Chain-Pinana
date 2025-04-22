<?php
// Include database connection
require_once 'db_connection.php';

// Function to check if a table exists
function tableExists($conn, $tableName) {
    $result = mysqli_query($conn, "SHOW TABLES LIKE '$tableName'");
    return mysqli_num_rows($result) > 0;
}

// Start transaction
mysqli_begin_transaction($conn);

try {
    // Create orders table if it doesn't exist
    if (!tableExists($conn, 'orders')) {
        $createOrdersTable = "
            CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(20) NOT NULL UNIQUE,
                customer_name VARCHAR(100) NOT NULL,
                customer_email VARCHAR(100),
                customer_phone VARCHAR(20),
                shipping_address TEXT,
                order_date DATE NOT NULL,
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
                payment_method VARCHAR(50) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                notes TEXT,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                INDEX (order_date),
                INDEX (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        
        if (!mysqli_query($conn, $createOrdersTable)) {
            throw new Exception("Error creating orders table: " . mysqli_error($conn));
        }
        
        echo "Orders table created successfully.<br>";
    } else {
        echo "Orders table already exists.<br>";
    }
    
    // Create order_items table if it doesn't exist
    if (!tableExists($conn, 'order_items')) {
        $createOrderItemsTable = "
            CREATE TABLE order_items (
                item_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(20) NOT NULL,
                product_id VARCHAR(20) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                INDEX (order_id),
                INDEX (product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        
        if (!mysqli_query($conn, $createOrderItemsTable)) {
            throw new Exception("Error creating order_items table: " . mysqli_error($conn));
        }
        
        echo "Order items table created successfully.<br>";
    } else {
        echo "Order items table already exists.<br>";
    }
    
    // Create order_status_history table if it doesn't exist
    if (!tableExists($conn, 'order_status_history')) {
        $createStatusHistoryTable = "
            CREATE TABLE order_status_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(20) NOT NULL,
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL,
                updated_at DATETIME NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                INDEX (order_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        
        if (!mysqli_query($conn, $createStatusHistoryTable)) {
            throw new Exception("Error creating order_status_history table: " . mysqli_error($conn));
        }
        
        echo "Order status history table created successfully.<br>";
    } else {
        echo "Order status history table already exists.<br>";
    }
    
    // Check if products table exists, if not create it
    if (!tableExists($conn, 'products')) {
        $createProductsTable = "
            CREATE TABLE products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id VARCHAR(20) NOT NULL UNIQUE,
                product_name VARCHAR(100) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                stocks INT NOT NULL DEFAULT 0,
                product_photo VARCHAR(255),
                status ENUM('In Stock', 'Low Stock', 'Out of Stock', 'Archived') NOT NULL DEFAULT 'In Stock',
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                INDEX (category),
                INDEX (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        
        if (!mysqli_query($conn, $createProductsTable)) {
            throw new Exception("Error creating products table: " . mysqli_error($conn));
        }
        
        echo "Products table created successfully.<br>";
        
        // Insert sample products
        $sampleProducts = [
            [
                'product_id' => 'PINE-001',
                'product_name' => 'Fresh Pineapple',
                'description' => 'Fresh, sweet pineapple from our farms',
                'category' => 'fresh',
                'price' => 99.50,
                'stocks' => 50,
                'status' => 'In Stock'
            ],
            [
                'product_id' => 'PINE-002',
                'product_name' => 'Pineapple Juice',
                'description' => '100% pure pineapple juice, no preservatives',
                'category' => 'beverages',
                'price' => 75.00,
                'stocks' => 100,
                'status' => 'In Stock'
            ],
            [
                'product_id' => 'PINE-003',
                'product_name' => 'Dried Pineapple',
                'description' => 'Naturally sweet dried pineapple slices',
                'category' => 'dried',
                'price' => 120.00,
                'stocks' => 30,
                'status' => 'In Stock'
            ],
            [
                'product_id' => 'PINE-004',
                'product_name' => 'Pineapple Jam',
                'description' => 'Homemade pineapple jam, perfect for breakfast',
                'category' => 'preserves',
                'price' => 85.00,
                'stocks' => 45,
                'status' => 'In Stock'
            ],
            [
                'product_id' => 'PINE-005',
                'product_name' => 'Pineapple Cake',
                'description' => 'Delicious pineapple upside-down cake',
                'category' => 'bakery',
                'price' => 250.00,
                'stocks' => 15,
                'status' => 'Low Stock'
            ],
            [
                'product_id' => 'PINE-006',
                'product_name' => 'Pineapple Vinegar',
                'description' => 'Artisanal pineapple vinegar for cooking and dressings',
                'category' => 'condiments',
                'price' => 95.00,
                'stocks' => 40,
                'status' => 'In Stock'
            ],
            [
                'product_id' => 'PINE-007',
                'product_name' => 'Pineapple Candy',
                'description' => 'Sweet pineapple-flavored candy',
                'category' => 'sweets',
                'price' => 45.00,
                'stocks' => 200,
                'status' => 'In Stock'
            ],
            [
                'product_id' => 'PINE-008',
                'product_name' => 'Pineapple Wine',
                'description' => 'Premium pineapple wine, aged to perfection',
                'category' => 'beverages',
                'price' => 350.00,
                'stocks' => 25,
                'status' => 'In Stock'
            ]
        ];
        
        $now = date('Y-m-d H:i:s');
        
        foreach ($sampleProducts as $product) {
            $insertProduct = "
                INSERT INTO products (
                    product_id, product_name, description, category, 
                    price, stocks, status, created_at, updated_at
                ) VALUES (
                    '{$product['product_id']}', 
                    '{$product['product_name']}', 
                    '{$product['description']}', 
                    '{$product['category']}', 
                    {$product['price']}, 
                    {$product['stocks']}, 
                    '{$product['status']}', 
                    '$now', 
                    '$now'
                )
            ";
            
            if (!mysqli_query($conn, $insertProduct)) {
                throw new Exception("Error inserting sample product: " . mysqli_error($conn));
            }
        }
        
        echo "Sample products inserted successfully.<br>";
    } else {
        echo "Products table already exists.<br>";
    }
    
    // Insert sample orders if orders table is empty
    $checkOrdersQuery = "SELECT COUNT(*) as count FROM orders";
    $result = mysqli_query($conn, $checkOrdersQuery);
    $row = mysqli_fetch_assoc($result);
    
    if ($row['count'] == 0) {
        // Sample orders
        $sampleOrders = [
            [
                'order_id' => 'ORD-230501-12345',
                'customer_name' => 'Juan Dela Cruz',
                'customer_email' => 'juan@example.com',
                'customer_phone' => '09123456789',
                'shipping_address' => '123 Main St, Manila, Philippines',
                'order_date' => '2023-05-01',
                'status' => 'delivered',
                'payment_method' => 'cash',
                'subtotal' => 445.00,
                'tax' => 53.40,
                'discount' => 0.00,
                'total_amount' => 498.40,
                'notes' => 'Please deliver in the morning',
                'items' => [
                    ['product_id' => 'PINE-001', 'quantity' => 2, 'price' => 99.50],
                    ['product_id' => 'PINE-002', 'quantity' => 1, 'price' => 75.00],
                    ['product_id' => 'PINE-004', 'quantity' => 2, 'price' => 85.00]
                ]
            ],
            [
                'order_id' => 'ORD-230510-67890',
                'customer_name' => 'Maria Santos',
                'customer_email' => 'maria@example.com',
                'customer_phone' => '09187654321',
                'shipping_address' => '456 Oak St, Quezon City, Philippines',
                'order_date' => '2023-05-10',
                'status' => 'shipped',
                'payment_method' => 'credit_card',
                'subtotal' => 620.00,
                'tax' => 74.40,
                'discount' => 50.00,
                'total_amount' => 644.40,
                'notes' => '',
                'items' => [
                    ['product_id' => 'PINE-003', 'quantity' => 1, 'price' => 120.00],
                    ['product_id' => 'PINE-005', 'quantity' => 2, 'price' => 250.00]
                ]
            ],
            [
                'order_id' => 'ORD-230515-24680',
                'customer_name' => 'Pedro Reyes',
                'customer_email' => 'pedro@example.com',
                'customer_phone' => '09198765432',
                'shipping_address' => '789 Pine St, Makati, Philippines',
                'order_date' => '2023-05-15',
                'status' => 'processing',
                'payment_method' => 'bank_transfer',
                'subtotal' => 395.00,
                'tax' => 47.40,
                'discount' => 0.00,
                'total_amount' => 442.40,
                'notes' => 'Gift wrap please',
                'items' => [
                    ['product_id' => 'PINE-006', 'quantity' => 1, 'price' => 95.00],
                    ['product_id' => 'PINE-007', 'quantity' => 2, 'price' => 45.00],
                    ['product_id' => 'PINE-002', 'quantity' => 3, 'price' => 75.00]
                ]
            ],
            [
                'order_id' => 'ORD-230520-13579',
                'customer_name' => 'Ana Gonzales',
                'customer_email' => 'ana@example.com',
                'customer_phone' => '09123459876',
                'shipping_address' => '101 Maple St, Pasig, Philippines',
                'order_date' => '2023-05-20',
                'status' => 'pending',
                'payment_method' => 'mobile_payment',
                'subtotal' => 350.00,
                'tax' => 42.00,
                'discount' => 0.00,
                'total_amount' => 392.00,
                'notes' => '',
                'items' => [
                    ['product_id' => 'PINE-008', 'quantity' => 1, 'price' => 350.00]
                ]
            ]
        ];
        
        $now = date('Y-m-d H:i:s');
        
        foreach ($sampleOrders as $order) {
            // Insert order
            $insertOrder = "
                INSERT INTO orders (
                    order_id, customer_name, customer_email, customer_phone, 
                    shipping_address, order_date, status, payment_method,
                    subtotal, tax, discount, total_amount, notes, created_at, updated_at
                ) VALUES (
                    '{$order['order_id']}', 
                    '{$order['customer_name']}', 
                    '{$order['customer_email']}', 
                    '{$order['customer_phone']}', 
                    '{$order['shipping_address']}', 
                    '{$order['order_date']}', 
                    '{$order['status']}', 
                    '{$order['payment_method']}',
                    {$order['subtotal']}, 
                    {$order['tax']}, 
                    {$order['discount']}, 
                    {$order['total_amount']}, 
                    '{$order['notes']}', 
                    '$now', 
                    '$now'
                )
            ";
            
            if (!mysqli_query($conn, $insertOrder)) {
                throw new Exception("Error inserting sample order: " . mysqli_error($conn));
            }
            
            // Insert order items
            foreach ($order['items'] as $item) {
                $insertItem = "
                    INSERT INTO order_items (
                        order_id, product_id, quantity, price
                    ) VALUES (
                        '{$order['order_id']}', 
                        '{$item['product_id']}', 
                        {$item['quantity']}, 
                        {$item['price']}
                    )
                ";
                
                if (!mysqli_query($conn, $insertItem)) {
                    throw new Exception("Error inserting order item: " . mysqli_error($conn));
                }
            }
            
            // Insert status history
            $insertHistory = "
                INSERT INTO order_status_history (
                    order_id, status, updated_at
                ) VALUES (
                    '{$order['order_id']}', 
                    '{$order['status']}', 
                    '$now'
                )
            ";
            
            if (!mysqli_query($conn, $insertHistory)) {
                throw new Exception("Error inserting status history: " . mysqli_error($conn));
            }
        }
        
        echo "Sample orders inserted successfully.<br>";
    } else {
        echo "Orders table already has data.<br>";
    }
    
    // Commit transaction
    mysqli_commit($conn);
    
    echo "<div style='margin-top: 20px; padding: 10px; background-color: #d4edda; color: #155724; border-radius: 5px;'>
        <strong>Success!</strong> All database tables have been created and sample data has been inserted.
    </div>";
    
} catch (Exception $e) {
    // Rollback transaction on error
    mysqli_rollback($conn);
    
    echo "<div style='margin-top: 20px; padding: 10px; background-color: #f8d7da; color: #721c24; border-radius: 5px;'>
        <strong>Error:</strong> " . $e->getMessage() . "
    </div>";
}

// Close connection
mysqli_close($conn);
?>

<div style="margin-top: 20px;">
    <a href="orders.html" class="btn btn-primary" style="display: inline-block; padding: 10px 15px; background-color: #f8d775; color: #333; text-decoration: none; border-radius: 5px; border: none;">
        Go to Orders Page
    </a>
</div>

