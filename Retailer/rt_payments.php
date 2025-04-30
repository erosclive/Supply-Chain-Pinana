<?php

session_start();
include 'db_connection.php'; 

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
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Piñana Gourmet - Payment Management</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  <!-- Flatpickr for date picking -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css">
  <!-- Pineapple Theme CSS -->
  <style>
    /* Pineapple Theme Colors */
    :root {
      --pineapple-yellow: #f5cc39;
      --pineapple-yellow-light: #ffeea3;
      --pineapple-yellow-dark: #e3b728;
      --pineapple-green: #59df99;
      --pineapple-green-light: #a1f3c5;
      --pineapple-green-dark: #19ac54;
      --pineapple-brown: #8b572a;
      --text-dark: #333333;
      --text-light: #6c757d;
      --background-light: #f9f9f9;
    }

    /* Status Badges */
    .status-badge {
      padding: 0.35em 0.65em;
      font-size: 0.75em;
      font-weight: 500;
      border-radius: 30px;
      display: inline-block;
      min-width: 90px;
      text-align: center;
    }

    .status-order {
      background-color: rgba(245, 204, 57, 0.15);
      color: var(--pineapple-yellow-dark);
    }

    .status-processing, .status-confirmed {
      background-color: rgba(13, 202, 240, 0.1);
      color: #0dcaf0;
    }

    .status-shipped {
      background-color: rgba(13, 110, 253, 0.1);
      color: #0d6efd;
    }

    .status-delivered {
      background-color: rgba(25, 135, 84, 0.1);
      color: #198754;
    }

    .status-cancelled, .status-issue {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    /* Stats Cards */
    .stats-card {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      height: 100%;
      border-left: 4px solid var(--pineapple-yellow);
    }

    .stats-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    /* Timeline Styles */
    .status-timeline {
      position: relative;
      margin-left: 20px;
    }

    .status-timeline-item {
      position: relative;
      padding-bottom: 20px;
      padding-left: 20px;
    }

    .status-timeline-item:before {
      content: '';
      position: absolute;
      left: -2px;
      top: 0;
      height: 100%;
      width: 2px;
      background-color: #e0e0e0;
    }

    .status-timeline-item:last-child:before {
      height: 10px;
    }

    .status-timeline-dot {
      position: absolute;
      left: -6px;
      top: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--pineapple-yellow);
    }

    .status-timeline-content {
      padding-left: 10px;
    }

    .status-timeline-title {
      font-weight: 600;
      margin-bottom: 2px;
    }

    .status-timeline-date {
      font-size: 0.8rem;
      color: var(--text-light);
      margin-bottom: 5px;
    }

    .status-timeline-notes {
      font-size: 0.9rem;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background-color: transparent;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .action-btn-view {
      color: var(--pineapple-yellow-dark);
    }

    .action-btn-receive {
      color: #198754;
    }

    .action-btn-issue {
      color: #dc3545;
    }

    /* Response Message */
    #response-message {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
    }
  </style>
</head>
<body>
  <!-- Response Message Alert -->
  <div id="response-message" class="alert" role="alert" style="display: none;"></div>

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
              <a class="nav-link" href="rt_dashboard.php" data-page="dashboard">
                <div class="nav-icon">
                  <i class="bi bi-grid"></i>
                </div>
                <span>Dashboard</span>
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
            <li class="nav-item">
              <a class="nav-link active" href="rt_delivery.php" data-page="delivery">
                <div class="nav-icon">
                  <i class="bi bi-credit-card"></i>
                </div>
                <span>Payment</span>
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
              <h5 class="mb-0" id="pageTitle">Payment Management</h5>
            </div>
            <div class="d-flex align-items-center">
              <div class="notification-container me-3">
                <div class="notification-icon">
                  <i class="bi bi-bell"></i>
                  <span class="badge bg-danger position-absolute top-0 start-100 translate-middle badge rounded-pill">3</span>
                </div>
              </div>
              <!-- User Profile Dropdown -->
              <div class="dropdown user-profile-dropdown">
                <div class="profile-circle dropdown-toggle" id="userProfileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-fill"></i>
                </div>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userProfileDropdown">
                  <li class="dropdown-item-text">
                    <div class="d-flex flex-column">
                    <span class="fw-bold"><?php echo htmlspecialchars($fullName); ?></span>
                      <small class="text-muted">Retailer</small>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="rt_profile.php"><i class="bi bi-person me-2"></i>My Profile</a></li>
                  <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" id="logoutButton"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
       
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
  <script src="payments.js"></script>
</body>
</html>
