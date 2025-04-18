<?php
// fetch_transactions.php - Retrieves transaction data for the POS system

// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

try {
    // Ensure database connection
    if (!$conn) {
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }

    // Prepare SQL query to fetch transaction data
    $sql = "SELECT 
                t.transaction_id, 
                t.transaction_date, 
                t.customer_name, 
                t.subtotal, 
                t.tax_amount, 
                t.discount_amount, 
                t.total_amount, 
                t.status, 
                t.cashier_id, 
                t.cashier_name,
                COUNT(ti.item_id) as item_count,
                pm.method_name as payment_method
            FROM 
                pos_transactions t
            LEFT JOIN 
                pos_transaction_items ti ON t.transaction_id = ti.transaction_id
            LEFT JOIN 
                pos_transaction_payments tp ON t.transaction_id = tp.transaction_id
            LEFT JOIN 
                pos_payment_methods pm ON tp.payment_method_id = pm.payment_method_id
            GROUP BY 
                t.transaction_id
            ORDER BY 
                t.transaction_date DESC";
    
    $result = mysqli_query($conn, $sql);

    if (!$result) {
        throw new Exception("Query failed: " . mysqli_error($conn));
    }

    // Fetch all transactions
    $transactions = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Get transaction items
        $itemsSql = "SELECT 
                        product_id, 
                        product_name, 
                        quantity, 
                        unit_price, 
                        tax_amount, 
                        subtotal, 
                        total_price
                    FROM 
                        pos_transaction_items
                    WHERE 
                        transaction_id = ?";
        
        $itemsStmt = mysqli_prepare($conn, $itemsSql);
        mysqli_stmt_bind_param($itemsStmt, 's', $row['transaction_id']);
        mysqli_stmt_execute($itemsStmt);
        $itemsResult = mysqli_stmt_get_result($itemsStmt);
        
        $items = [];
        while ($itemRow = mysqli_fetch_assoc($itemsResult)) {
            $items[] = $itemRow;
        }
        
        // Add items to transaction
        $row['items'] = $items;
        
        $transactions[] = $row;
    }

    // Return JSON response
    echo json_encode([
        'success' => true,
        'transactions' => $transactions,
        'count' => count($transactions)
    ]);

} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close connection
    if (isset($conn)) {
        mysqli_close($conn);
    }
}
?>

