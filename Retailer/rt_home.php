<?php
session_start();
include 'db_connection.php'; 

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$retailer_id = $_SESSION['user_id'];

$sql = "SELECT first_name, last_name FROM retailer_profiles WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $retailer_id);
$stmt->execute();
$result = $stmt->get_result();
$fullName = "Retailer Name"; 

if ($row = $result->fetch_assoc()) {
    $fullName = $row['first_name'] . ' ' . $row['last_name'];
}

// Get notification count - Commenting out the problematic code for now
// We'll assume there are no notifications until we know the correct table structure
$notificationCount = 0;

/* 
// This was causing the error - we need to know the correct column name
$notificationSql = "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0";
$notificationStmt = $conn->prepare($notificationSql);
$notificationStmt->bind_param("i", $retailer_id);
$notificationStmt->execute();
$notificationResult = $notificationStmt->get_result();
$notificationCount = 0;

if ($notificationRow = $notificationResult->fetch_assoc()) {
    $notificationCount = $notificationRow['count'];
}
*/
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Piñana Gourmet Retailer</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  <!-- Flatpickr for date picking -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css">
  <style>
    /* Additional styles for dashboard */
    .main-content {
      padding-top: 60px;
    }
    .card {
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      padding: 15px 20px;
    }
    .table th {
      font-weight: 600;
      color: #495057;
    }
    .btn-outline-primary {
      border-color: #6c757d;
      color: #6c757d;
    }
    .btn-outline-primary:hover {
      background-color: #6c757d;
      border-color: #6c757d;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-3 col-lg-2 d-md-block sidebar" id="sidebar">
        <div class="sidebar-inner">
            <div class="logo-container d-flex align-items-center mb-4 mt-3">
                <img src="final-light.png" class="pineapple-logo" alt="Piñana Gourmet Logo">
            </div>
          
          <div class="sidebar-divider">
            <span>MAIN MENU</span>
          </div>
          
          <ul class="nav flex-column sidebar-nav">
            <li class="nav-item">
              <a class="nav-link active" href="rt_home.php" data-page="home">
                <div class="nav-icon">
                  <i class="bi bi-grid"></i>
                </div>
                <span>Home</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="rt_inventory.php" data-page="inventory">
                <div class="nav-icon">
                  <i class="bi bi-box"></i>
                </div>
                <span>Inventory</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="rt_orders.php" data-page="orders">
                <div class="nav-icon">
                  <i class="bi bi-cart"></i>
                </div>
                <span>Orders</span>
              </a>
            </li>
          
          </ul>
          
        </div>
      </div>
      
      <!-- Main content -->
      <div class="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content">
        <!-- Header -->
        <div class="fixed-top-header">
          <div class="d-flex justify-content-between align-items-center w-100">
            <div class="d-flex align-items-center">
              <button class="navbar-toggler d-md-none collapsed me-2" type="button" id="sidebarToggle">
                <i class="bi bi-list"></i>
              </button>
              <h5 class="mb-0" id="pageTitle">HOME</h5>
            </div>
            <div class="d-flex align-items-center">
              <div class="notification-container me-3">
                <div class="notification-icon">
                  <i class="bi bi-bell"></i>
                  <span class="badge bg-danger position-absolute top-0 start-100 translate-middle badge rounded-pill"><?php echo $notificationCount; ?></span>
                </div>
              </div>
              <!-- User Profile Dropdown -->
              <div class="dropdown user-profile-dropdown">
                <div class="profile-circle dropdown-toggle position-relative" id="userProfileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-fill"></i>
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge" id="notification-badge" style="display: none;">
                    0
                    <span class="visually-hidden">unread notifications</span>
                  </span>
                </div>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userProfileDropdown" style="width: 350px;">
                  <li class="dropdown-item-text">
                    <div class="sidebar-divider">
                      <span>NOTIFICATIONS</span>
                      <div class="float-end">
                        <button class="btn btn-sm btn-link text-decoration-none p-0" id="mark-all-read">Mark all as read</button>
                      </div>
                    </div>
                    <div id="notifications-container" class="notifications-container" style="max-height: 300px; overflow-y: auto;">
                      <div class="text-center py-3 text-muted" id="no-notifications-message">No new notifications</div>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li class="dropdown-item-text">
                    <div class="sidebar-divider">
                      <span>ACCOUNT</span>
                    </div>
                    <div class="user-info d-flex align-items-center">
                      <div class="user-avatar">
                        <i class="bi bi-person-circle"></i>
                      </div>
                      <div class="user-details">
                        <div class="user-name"><?php echo htmlspecialchars($fullName); ?></div>
                        <div class="user-role">Retailer</div>
                      </div>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="logout.php" id="logoutButton"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Dashboard content will be loaded here by home.js -->
      </div>
    </div>
  </div>

  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Flatpickr JS -->
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  <!-- jQuery (needed for some functionality) -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Custom JavaScript -->
  <script src="scripts.js"></script>
  <script src="home.js"></script>
</body>
</html>