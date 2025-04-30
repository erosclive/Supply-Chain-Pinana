<?php
include 'db_connection.php'; // make sure to create a db_connection.php to connect your database

$action = $_GET['action'] ?? $_POST['action'];

switch ($action) {
  case 'fetch_orders':
    fetchOrders();
    break;
  case 'view_order':
    viewOrder();
    break;
  case 'confirm_order':
    confirmOrder();
    break;
  case 'delete_order':
    deleteOrder();
    break;
}

function fetchOrders() {
  global $conn;

  $status = $_GET['status'] ?? 'all';
  $search = $_GET['search'] ?? '';

  $where = '';
  if ($status != 'all') {
    $where .= " AND ro.status = '$status'";
  }
  if (!empty($search)) {
    $where .= " AND (ro.order_id LIKE '%$search%' OR ro.po_number LIKE '%$search%')";
  }

  $query = "SELECT ro.*, 
            (SELECT SUM(quantity) FROM retailer_order_items roi WHERE roi.order_id = ro.order_id) AS total_items,
            (SELECT SUM(quantity * price) FROM retailer_order_items roi WHERE roi.order_id = ro.order_id) AS total_amount
            FROM retailer_orders ro
            WHERE 1=1 $where
            ORDER BY ro.order_date DESC";

  $result = $conn->query($query);

  $orders = [];
  while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
  }

  echo json_encode(['orders' => $orders]);
}

function viewOrder() {
  global $conn;
  $order_id = $_GET['order_id'];

  $query = "SELECT * FROM retailer_order_items WHERE order_id = '$order_id'";
  $result = $conn->query($query);

  $html = '<table class="table table-striped">';
  $html .= '<thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead><tbody>';

  while ($row = $result->fetch_assoc()) {
    $total = $row['quantity'] * $row['price'];
    $html .= "<tr>
                <td>{$row['product_name']}</td>
                <td>{$row['quantity']}</td>
                <td>₱" . number_format($row['price'], 2) . "</td>
                <td>₱" . number_format($total, 2) . "</td>
              </tr>";
  }

  $html .= '</tbody></table>';

  echo $html;
}

function confirmOrder() {
  global $conn;
  $order_id = $_POST['order_id'];

  $query = "UPDATE retailer_orders SET status = 'confirmed' WHERE order_id = '$order_id'";
  $conn->query($query);

  // Insert to status history
  $conn->query("INSERT INTO retailer_order_status_history (order_id, status, changed_at) VALUES ('$order_id', 'confirmed', NOW())");

  echo json_encode(['success' => true]);
}

function deleteOrder() {
  global $conn;
  $order_id = $_POST['order_id'];

  $conn->query("DELETE FROM retailer_order_items WHERE order_id = '$order_id'");
  $conn->query("DELETE FROM retailer_orders WHERE order_id = '$order_id'");
  $conn->query("DELETE FROM retailer_order_status_history WHERE order_id = '$order_id'");

  echo json_encode(['success' => true]);
}
?>
