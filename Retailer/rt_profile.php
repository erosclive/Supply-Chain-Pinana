<?php
// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Include database operations file
require_once 'profile_operations.php';

// Get user ID from session
$user_id = $_SESSION['user_id'];

// Fetch user data
$user_data = getUserData($conn, $user_id);
if (!$user_data) {
    die("Error: User not found");
}

// Fetch retailer profile data
$profile_data = getRetailerProfile($conn, $user_id);
if (!$profile_data) {
    die("Error: Retailer profile not found");
}

// Try to fetch recent orders
try {
    $recent_orders = getRecentOrders($conn, $user_id, 3);
} catch (Exception $e) {
    // If there's an error, use an empty array
    $recent_orders = [];
    // Log the error for debugging
    error_log("Error fetching recent orders: " . $e->getMessage());
}

// Try to fetch user activity and login history if tables exist
try {
    $user_activity = getUserActivity($conn, $user_id, 5);
    $login_history = getLoginHistory($conn, $user_id, 3);
} catch (Exception $e) {
    // If tables don't exist, use empty arrays
    $user_activity = [];
    $login_history = [];
    // Log the error for debugging
    error_log("Error fetching activity or login history: " . $e->getMessage());
}

// Initialize messages
$success_message = $_SESSION['success_message'] ?? '';
$error_message = $_SESSION['error_message'] ?? '';

// Clear session messages
unset($_SESSION['success_message']);
unset($_SESSION['error_message']);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Piñana Gourmet - My Profile</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
  <!-- Flatpickr for date picking -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css">
  <!-- Profile specific CSS -->
  <style>
    :root {
      --primary-color: #59df99;
      --primary-light: rgba(89, 223, 153, 0.1);
      --primary-dark: #3db978;
      --secondary-color: #f87500;
      --text-color: #333333;
      --text-muted: #6c757d;
      --border-color: #e9ecef;
      --card-bg: #ffffff;
      --body-bg: #f8f9fa;
      --header-bg: #ffffff;
    }
    
    body {
      background-color: var(--body-bg);
      color: var(--text-color);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding-top: 0;
      min-height: 100vh;
    }
    
    /* Modern Header */
    .modern-header {
      background-color: var(--header-bg);
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .back-button {
      display: inline-flex;
      align-items: center;
      color: var(--text-color);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .back-button:hover {
      color: var(--primary-color);
      transform: translateX(-3px);
    }
    
    .back-button i {
      margin-right: 0.5rem;
      font-size: 1.2rem;
    }
    
    .profile-header {
      background-color: var(--card-bg);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
    }
    
    .profile-header:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
    
    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: white;
      margin-right: 2rem;
      box-shadow: 0 5px 15px rgba(89, 223, 153, 0.3);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    
    .profile-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .profile-avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .profile-avatar:hover .profile-avatar-overlay {
      opacity: 1;
    }
    
    .profile-avatar-overlay i {
      color: white;
      font-size: 1.5rem;
    }
    
    .profile-info h2 {
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .profile-info p {
      margin-bottom: 0.25rem;
      color: var(--text-muted);
    }
    
    .profile-tabs {
      border-bottom: none;
      margin-bottom: 2rem;
    }
    
    .profile-tabs .nav-link {
      color: var(--text-color);
      border-radius: 8px;
      padding: 0.75rem 1.25rem;
      font-weight: 500;
      margin-right: 0.5rem;
      transition: all 0.2s ease;
      border: none;
    }
    
    .profile-tabs .nav-link.active {
      color: white;
      background-color: var(--primary-color);
      box-shadow: 0 4px 10px rgba(89, 223, 153, 0.3);
    }
    
    .profile-tabs .nav-link:hover:not(.active) {
      background-color: var(--primary-light);
    }
    
    .profile-tabs .nav-link i {
      margin-right: 0.5rem;
    }
    
    .profile-card {
      border: none;
      border-radius: 16px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .profile-card:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
    
    .profile-card .card-header {
      background-color: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 1.25rem 1.5rem;
    }
    
    .profile-card .card-header h5 {
      margin-bottom: 0;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    
    .profile-card .card-header h5 i {
      margin-right: 0.75rem;
      color: var(--primary-color);
    }
    
    .profile-card .card-body {
      padding: 1.5rem;
    }
    
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .form-control, .form-select {
      border-radius: 8px;
      padding: 0.6rem 1rem;
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }
    
    .form-control:focus, .form-select:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.25rem rgba(89, 223, 153, 0.25);
    }
    
    .btn {
      border-radius: 8px;
      padding: 0.6rem 1.25rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .btn-primary:hover {
      background-color: var(--primary-dark);
      border-color: var(--primary-dark);
    }
    
    .btn-outline-primary {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .btn-outline-primary:hover {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .verification-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 20px;
    }
    
    .verification-badge.verified {
      background-color: rgba(25, 135, 84, 0.1);
      color: #198754;
    }
    
    .verification-badge.unverified {
      background-color: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }
    
    .verification-badge i {
      margin-right: 5px;
    }
    
    .social-media-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
      color: var(--text-muted);
    }
    
    .facebook-icon { color: #1877F2; }
    .instagram-icon { color: #E4405F; }
    .tiktok-icon { color: #000000; }
    
    .activity-timeline {
      position: relative;
      padding-left: 30px;
    }
    
    .activity-item {
      position: relative;
      padding-bottom: 1.5rem;
      margin-left: 15px;
    }
    
    .activity-item:last-child {
      padding-bottom: 0;
    }
    
    .activity-item::before {
      content: "";
      position: absolute;
      left: -30px;
      top: 10px;
      bottom: 0;
      width: 2px;
      background-color: var(--border-color);
    }
    
    .activity-item:last-child::before {
      display: none;
    }
    
    .activity-icon {
      position: absolute;
      left: -45px;
      top: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--primary-light);
      border-radius: 50%;
      border: 2px solid var(--primary-color);
      z-index: 1;
      color: var(--primary-color);
    }
    
    .activity-content {
      padding: 0 0 0 15px;
    }
    
    .activity-content h6 {
      margin-bottom: 5px;
      font-weight: 600;
    }
    
    .activity-content p {
      margin-bottom: 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    .activity-date {
      font-size: 0.75rem;
      color: #adb5bd;
    }
    
    .list-group-item {
      border-left: none;
      border-right: none;
      padding: 1rem 1.25rem;
      transition: all 0.2s ease;
    }
    
    .list-group-item:first-child {
      border-top: none;
    }
    
    .list-group-item:last-child {
      border-bottom: none;
    }
    
    .list-group-item-action:hover {
      background-color: var(--primary-light);
    }
    
    #alert-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 350px;
    }
    
    #alert-container .alert {
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 10px;
      border: none;
    }
    
    .alert-success {
      background-color: rgba(25, 135, 84, 0.1);
      color: #198754;
    }
    
    .alert-danger {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }
    
    /* Modal styles */
    .modal-content {
      border: none;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
      border-bottom: 1px solid var(--border-color);
      padding: 1.25rem 1.5rem;
    }
    
    .modal-header .modal-title {
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    
    .modal-header .modal-title i {
      margin-right: 0.75rem;
      color: var(--primary-color);
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .modal-footer {
      border-top: 1px solid var(--border-color);
      padding: 1.25rem 1.5rem;
    }
    
    /* Profile image upload */
    .profile-image-preview {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .profile-image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .profile-image-upload {
      position: relative;
      margin: 0 auto;
      width: 200px;
    }
    
    .profile-image-upload input[type="file"] {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    .tab-pane {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    /* Responsive adjustments */
    @media (max-width: 767.98px) {
      .profile-header {
        padding: 1.5rem;
      }
      
      .profile-avatar {
        width: 80px;
        height: 80px;
        font-size: 2rem;
        margin-right: 1rem;
      }
      
      .profile-tabs .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
      }
      
      .profile-card .card-header,
      .profile-card .card-body {
        padding: 1rem;
      }
    }
  </style>
</head>
<body>
  <div id="alert-container">
    <?php if (!empty($success_message)): ?>
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> <?php echo $success_message; ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    <?php endif; ?>
    
    <?php if (!empty($error_message)): ?>
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> <?php echo $error_message; ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    <?php endif; ?>
  </div>

  <!-- Modern Header -->
  <header class="modern-header mb-4">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <a href="javascript:history.back()" class="back-button">
            <i class="bi bi-arrow-left"></i> Back
          </a>
        </div>
        <div class="d-flex align-items-center">
          <div class="dropdown">
            <div class="d-flex align-items-center" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <span class="me-2"><?php echo $profile_data['first_name']; ?></span>
              <div class="profile-circle" style="width: 40px; height: 40px; background-color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                <?php echo strtoupper(substr($profile_data['first_name'], 0, 1)); ?>
              </div>
            </div>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="rt_dashboard.php"><i class="bi bi-grid me-2"></i>Dashboard</a></li>
              <li><a class="dropdown-item" href="rt_inventory.php"><i class="bi bi-box me-2"></i>Inventory</a></li>
              <li><a class="dropdown-item" href="rt_orders.php"><i class="bi bi-cart me-2"></i>Orders</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" id="logoutButton"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="container">
    <!-- Profile Header -->
    <div class="profile-header d-flex align-items-center fade-in">
      <div class="profile-avatar" id="profileAvatar">
        <?php if (!empty($profile_data['profile_image'])): ?>
          <img src="<?php echo $profile_data['profile_image']; ?>" alt="Profile Image">
        <?php else: ?>
          <?php echo strtoupper(substr($profile_data['first_name'], 0, 1) . substr($profile_data['last_name'], 0, 1)); ?>
        <?php endif; ?>
        <div class="profile-avatar-overlay">
          <i class="bi bi-camera"></i>
        </div>
      </div>
      <div class="profile-info">
        <h2><?php echo $profile_data['first_name'] . ' ' . $profile_data['last_name']; ?></h2>
        <p class="mb-1"><?php echo $profile_data['business_name']; ?></p>
        <p class="mb-2"><?php echo $user_data['email']; ?></p>
        <?php if (isset($user_data['email_verified']) && $user_data['email_verified'] == 1): ?>
          <span class="verification-badge verified">
            <i class="bi bi-check-circle-fill"></i> Email Verified
          </span>
        <?php else: ?>
          <span class="verification-badge unverified">
            <i class="bi bi-exclamation-circle-fill"></i> Email Not Verified
          </span>
        <?php endif; ?>
      </div>
    </div>
    
    <!-- Profile Tabs -->
    <ul class="nav nav-tabs profile-tabs mb-4" id="profileTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="true">
          <i class="bi bi-person"></i>Profile
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="account-tab" data-bs-toggle="tab" data-bs-target="#account-tab-pane" type="button" role="tab" aria-controls="account-tab-pane" aria-selected="false">
          <i class="bi bi-shield-lock"></i>Account
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="activity-tab" data-bs-toggle="tab" data-bs-target="#activity-tab-pane" type="button" role="tab" aria-controls="activity-tab-pane" aria-selected="false">
          <i class="bi bi-clock-history"></i>Activity
        </button>
      </li>
    </ul>
    
    <!-- Tab Content -->
    <div class="tab-content" id="profileTabsContent">
      <!-- Profile Tab -->
      <div class="tab-pane fade show active" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
        <div class="row">
          <div class="col-lg-8">
            <!-- Personal Information -->
            <div class="card profile-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="bi bi-person-vcard"></i>Personal Information</h5>
                <button class="btn btn-sm btn-outline-primary" type="button" data-bs-toggle="modal" data-bs-target="#personalInfoModal">
                  <i class="bi bi-pencil me-1"></i> Edit
                </button>
              </div>
              <div class="card-body">
                <div class="row mb-4">
                  <div class="col-md-6 mb-3 mb-md-0">
                    <p class="text-muted mb-1">Full Name</p>
                    <p class="fw-medium"><?php echo $profile_data['first_name'] . ' ' . $profile_data['last_name']; ?></p>
                  </div>
                  <div class="col-md-6">
                    <p class="text-muted mb-1">Birthday</p>
                    <p class="fw-medium"><?php echo date('F j, Y', strtotime($profile_data['birthday'])); ?> (<?php echo $profile_data['age']; ?> years old)</p>
                  </div>
                </div>
                <div class="row mb-4">
                  <div class="col-md-6 mb-3 mb-md-0">
                    <p class="text-muted mb-1">Nationality</p>
                    <p class="fw-medium"><?php echo $profile_data['nationality']; ?></p>
                  </div>
                  <div class="col-md-6">
                    <p class="text-muted mb-1">Phone Number</p>
                    <p class="fw-medium"><?php echo $profile_data['phone']; ?></p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Business Information -->
            <div class="card profile-card mt-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="bi bi-shop"></i>Business Information</h5>
                <button class="btn btn-sm btn-outline-primary" type="button" data-bs-toggle="modal" data-bs-target="#businessInfoModal">
                  <i class="bi bi-pencil me-1"></i> Edit
                </button>
              </div>
              <div class="card-body">
                <div class="row mb-4">
                  <div class="col-md-6 mb-3 mb-md-0">
                    <p class="text-muted mb-1">Business Name</p>
                    <p class="fw-medium"><?php echo $profile_data['business_name']; ?></p>
                  </div>
                  <div class="col-md-6">
                    <p class="text-muted mb-1">Business Type</p>
                    <p class="fw-medium">
                      <?php 
                        echo $profile_data['business_type'] == 0 ? 'Retail Store' : 'Wholesale';
                      ?>
                    </p>
                  </div>
                </div>
                <div class="mb-4">
                  <p class="text-muted mb-1">Business Address</p>
                  <p class="fw-medium"><?php echo $profile_data['business_address']; ?></p>
                </div>
              </div>
            </div>
            
            <!-- Social Media -->
            <div class="card profile-card mt-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="bi bi-share"></i>Social Media</h5>
                <button class="btn btn-sm btn-outline-primary" type="button" data-bs-toggle="modal" data-bs-target="#socialMediaModal">
                  <i class="bi bi-pencil me-1"></i> Edit
                </button>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-facebook social-media-icon facebook-icon"></i>
                  <div>
                    <p class="text-muted mb-0">Facebook</p>
                    <p class="fw-medium mb-0">
                      <?php echo !empty($profile_data['facebook']) ? $profile_data['facebook'] : 'Not provided'; ?>
                    </p>
                  </div>
                </div>
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-instagram social-media-icon instagram-icon"></i>
                  <div>
                    <p class="text-muted mb-0">Instagram</p>
                    <p class="fw-medium mb-0">
                      <?php echo !empty($profile_data['instagram']) ? $profile_data['instagram'] : 'Not provided'; ?>
                    </p>
                  </div>
                </div>
                <div class="d-flex align-items-center">
                  <i class="bi bi-tiktok social-media-icon tiktok-icon"></i>
                  <div>
                    <p class="text-muted mb-0">TikTok</p>
                    <p class="fw-medium mb-0">
                      <?php echo !empty($profile_data['tiktok']) ? $profile_data['tiktok'] : 'Not provided'; ?>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4">
            <!-- Account Summary -->
            <div class="card profile-card">
              <div class="card-header">
                <h5><i class="bi bi-info-circle"></i>Account Summary</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <p class="text-muted mb-1">Account Status</p>
                  <p class="fw-medium">
                    <?php if (isset($user_data['is_active']) && $user_data['is_active'] == 1): ?>
                      <span class="badge bg-success">Active</span>
                    <?php else: ?>
                      <span class="badge bg-danger">Inactive</span>
                    <?php endif; ?>
                  </p>
                </div>
                <div class="mb-3">
                  <p class="text-muted mb-1">Account Created</p>
                  <p class="fw-medium"><?php echo date('F j, Y', strtotime($user_data['created_at'])); ?></p>
                </div>
                <div class="mb-3">
                  <p class="text-muted mb-1">Last Login</p>
                  <p class="fw-medium">
                    <?php 
                      echo !empty($user_data['last_login']) ? date('F j, Y g:i A', strtotime($user_data['last_login'])) : 'Never';
                    ?>
                  </p>
                </div>
                <div>
                  <p class="text-muted mb-1">Email Verification</p>
                  <p class="fw-medium">
                    <?php if (isset($user_data['email_verified']) && $user_data['email_verified'] == 1): ?>
                      <span class="verification-badge verified">
                        <i class="bi bi-check-circle-fill"></i> Verified
                      </span>
                    <?php else: ?>
                      <span class="verification-badge unverified">
                        <i class="bi bi-exclamation-circle-fill"></i> Not Verified
                      </span>
                      <button class="btn btn-sm btn-outline-warning mt-2">
                        <i class="bi bi-envelope me-1"></i> Resend Verification
                      </button>
                    <?php endif; ?>
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Recent Orders -->
            <div class="card profile-card mt-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="bi bi-bag"></i>Recent Orders</h5>
                <a href="rt_orders.php" class="btn btn-sm btn-outline-primary">View All</a>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <?php if (empty($recent_orders)): ?>
                    <div class="list-group-item text-center py-4">
                      <i class="bi bi-bag-x fs-3 text-muted mb-2"></i>
                      <p class="mb-0">No recent orders found</p>
                    </div>
                  <?php else: ?>
                    <?php foreach ($recent_orders as $order): ?>
                      <a href="rt_orders.php?view=<?php echo $order['order_id']; ?>" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                          <h6 class="mb-1">Order #<?php echo $order['order_id']; ?></h6>
                          <small><?php echo date('M j', strtotime($order['order_date'])); ?></small>
                        </div>
                        <p class="mb-1"><?php echo $order['item_count']; ?> products - ₱<?php echo number_format($order['total_amount'], 2); ?></p>
                        <small class="<?php echo getStatusClass($order['status']); ?>"><?php echo ucfirst($order['status']); ?></small>
                      </a>
                    <?php endforeach; ?>
                  <?php endif; ?>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Account Tab -->
      <div class="tab-pane fade" id="account-tab-pane" role="tabpanel" aria-labelledby="account-tab" tabindex="0">
        <div class="row">
          <div class="col-lg-8">
            <!-- Account Information -->
            <div class="card profile-card">
              <div class="card-header">
                <h5><i class="bi bi-person-badge"></i>Account Information</h5>
              </div>
              <div class="card-body">
                <form data-form-type="account">
                  <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" value="<?php echo $user_data['username']; ?>" readonly>
                    <div class="form-text">Username cannot be changed.</div>
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" class="form-control" id="email" name="email" value="<?php echo $user_data['email']; ?>" required>
                  </div>
                  <hr class="my-4">
                  <h6 class="mb-3">Change Password</h6>
                  <div class="mb-3">
                    <label for="current_password" class="form-label">Current Password</label>
                    <input type="password" class="form-control" id="current_password" name="current_password">
                    <div class="form-text">Leave blank if you don't want to change your password.</div>
                  </div>
                  <div class="mb-3">
                    <label for="new_password" class="form-label">New Password</label>
                    <input type="password" class="form-control" id="new_password" name="new_password">
                  </div>
                  <div class="mb-3">
                    <label for="confirm_password" class="form-label">Confirm New Password</label>
                    <input type="password" class="form-control" id="confirm_password" name="confirm_password">
                  </div>
                  <div class="text-end">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Email Preferences -->
            <div class="card profile-card mt-4">
              <div class="card-header">
                <h5><i class="bi bi-envelope"></i>Email Preferences</h5>
              </div>
              <div class="card-body">
                <form data-form-type="preferences">
                  <div class="mb-3">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="orderNotifications" checked>
                      <label class="form-check-label" for="orderNotifications">Order Notifications</label>
                    </div>
                    <div class="form-text">Receive email notifications about your orders.</div>
                  </div>
                  <div class="mb-3">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="productUpdates" checked>
                      <label class="form-check-label" for="productUpdates">Product Updates</label>
                    </div>
                    <div class="form-text">Receive email notifications about product updates.</div>
                  </div>
                  <div class="mb-3">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="promotionalEmails">
                      <label class="form-check-label" for="promotionalEmails">Promotional Emails</label>
                    </div>
                    <div class="form-text">Receive promotional emails and special offers.</div>
                  </div>
                  <div class="text-end">
                    <button type="submit" class="btn btn-primary">Save Preferences</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4">
            <!-- Account Security -->
            <div class="card profile-card">
              <div class="card-header">
                <h5><i class="bi bi-shield-lock"></i>Account Security</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <p class="text-muted mb-1">Two-Factor Authentication</p>
                  <p class="fw-medium">
                    <span class="badge bg-danger">Not Enabled</span>
                  </p>
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-shield-plus me-1"></i> Enable 2FA
                  </button>
                </div>
                <hr>
                <div class="mb-3">
                  <p class="text-muted mb-1">Last Password Change</p>
                  <p class="fw-medium">Never</p>
                </div>
                <hr>
                <div>
                  <p class="text-muted mb-1">Account Actions</p>
                  <button class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash me-1"></i> Delete Account
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Connected Devices -->
            <div class="card profile-card mt-4">
              <div class="card-header">
                <h5><i class="bi bi-laptop"></i>Connected Devices</h5>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <div class="me-3">
                    <i class="bi bi-laptop fs-3"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">Windows PC - Chrome</h6>
                    <p class="text-muted mb-0 small">Manila, Philippines</p>
                    <p class="text-success mb-0 small">Current Device</p>
                  </div>
                </div>
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <i class="bi bi-phone fs-3"></i>
                  </div>
                  <div>
                    <h6 class="mb-1">iPhone - Safari</h6>
                    <p class="text-muted mb-0 small">Manila, Philippines</p>
                    <p class="text-muted mb-0 small">Last active: 2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Activity Tab -->
      <div class="tab-pane fade" id="activity-tab-pane" role="tabpanel" aria-labelledby="activity-tab" tabindex="0">
        <div class="row">
          <div class="col-lg-8">
            <!-- Activity Timeline -->
            <div class="card profile-card">
              <div class="card-header">
                <h5><i class="bi bi-clock-history"></i>Activity Timeline</h5>
              </div>
              <div class="card-body">
                <div class="activity-timeline">
                  <?php if (empty($user_activity)): ?>
                    <div class="text-center py-4">
                      <i class="bi bi-calendar-x fs-3 text-muted mb-2"></i>
                      <p class="mb-0">No activity records found</p>
                    </div>
                  <?php else: ?>
                    <?php foreach ($user_activity as $activity): ?>
                      <div class="activity-item">
                        <div class="activity-icon">
                          <i class="bi <?php echo getActivityIcon($activity['activity_type']); ?>"></i>
                        </div>
                        <div class="activity-content">
                          <h6><?php echo $activity['activity_title']; ?></h6>
                          <p><?php echo $activity['activity_description']; ?></p>
                          <span class="activity-date"><?php echo getTimeAgo($activity['activity_date']); ?></span>
                        </div>
                      </div>
                    <?php endforeach; ?>
                  <?php endif; ?>
                  
                  <!-- Fallback activity items if no records found -->
                  <?php if (empty($user_activity)): ?>
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="bi bi-cart-check"></i>
                      </div>
                      <div class="activity-content">
                        <h6>Order Placed</h6>
                        <p>You placed an order for 5 products.</p>
                        <span class="activity-date">3 days ago</span>
                      </div>
                    </div>
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="bi bi-person"></i>
                      </div>
                      <div class="activity-content">
                        <h6>Profile Updated</h6>
                        <p>You updated your profile information.</p>
                        <span class="activity-date">5 days ago</span>
                      </div>
                    </div>
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="bi bi-person-check"></i>
                      </div>
                      <div class="activity-content">
                        <h6>Account Created</h6>
                        <p>You created your account.</p>
                        <span class="activity-date"><?php echo date('F j, Y', strtotime($user_data['created_at'])); ?></span>
                      </div>
                    </div>
                  <?php endif; ?>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4">
            <!-- Login History -->
            <div class="card profile-card">
              <div class="card-header">
                <h5><i class="bi bi-box-arrow-in-right"></i>Login History</h5>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <?php if (empty($login_history)): ?>
                    <div class="list-group-item text-center py-4">
                      <i class="bi bi-clock-history fs-3 text-muted mb-2"></i>
                      <p class="mb-0">No login history found</p>
                    </div>
                  <?php else: ?>
                    <?php foreach ($login_history as $index => $login): ?>
                      <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                          <h6 class="mb-1"><?php echo $index === 0 ? 'Current Session' : 'Previous Login'; ?></h6>
                          <small <?php echo $index === 0 ? 'class="text-success"' : ''; ?>>
                            <?php echo $index === 0 ? 'Active' : getTimeAgo($login['login_time']); ?>
                          </small>
                        </div>
                        <p class="mb-1"><?php echo $login['device']; ?> - <?php echo $login['browser']; ?></p>
                        <small class="text-muted"><?php echo $login['location']; ?> - <?php echo date('M j, Y g:i A', strtotime($login['login_time'])); ?></small>
                      </div>
                    <?php endforeach; ?>
                  <?php endif; ?>
                  
                  <!-- Fallback login history if no records found -->
                  <?php if (empty($login_history)): ?>
                    <div class="list-group-item">
                      <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Current Session</h6>
                        <small class="text-success">Active</small>
                      </div>
                      <p class="mb-1">Windows PC - Chrome</p>
                      <small class="text-muted">Manila, Philippines - <?php echo date('M j, Y g:i A'); ?></small>
                    </div>
                    <div class="list-group-item">
                      <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Previous Login</h6>
                        <small>2 days ago</small>
                      </div>
                      <p class="mb-1">iPhone - Safari</p>
                      <small class="text-muted">Manila, Philippines - <?php echo date('M j, Y g:i A', strtotime('-2 days')); ?></small>
                    </div>
                  <?php endif; ?>
                </div>
              </div>
            </div>
            
            <!-- System Notifications -->
            <div class="card profile-card mt-4">
              <div class="card-header">
                <h5><i class="bi bi-bell"></i>System Notifications</h5>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                      <h6 class="mb-1">Order Status Update</h6>
                      <small>1 day ago</small>
                    </div>
                    <p class="mb-1">Your order is now being processed.</p>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                      <h6 class="mb-1">Order Delivered</h6>
                      <small>3 days ago</small>
                    </div>
                    <p class="mb-1">Your order has been delivered.</p>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                      <h6 class="mb-1">New Product Available</h6>
                      <small>1 week ago</small>
                    </div>
                    <p class="mb-1">New pineapple products are now available!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Profile Image Modal -->
  <div class="modal fade" id="profileImageModal" tabindex="-1" aria-labelledby="profileImageModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="profileImageModalLabel">
            <i class="bi bi-camera"></i>Profile Image
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-center">
          <div class="profile-image-preview">
            <?php if (!empty($profile_data['profile_image'])): ?>
              <img src="<?php echo $profile_data['profile_image']; ?>" alt="Profile Image" id="profileImagePreview" style="width: 100%; height: 100%; object-fit: cover;">
            <?php else: ?>
              <div style="width: 100%; height: 100%; background-color: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                <?php echo strtoupper(substr($profile_data['first_name'], 0, 1) . substr($profile_data['last_name'], 0, 1)); ?>
              </div>
            <?php endif; ?>
          </div>
          
          <form id="profileImageForm" enctype="multipart/form-data">
            <div class="profile-image-upload">
              <input type="file" name="profile_image" id="profileImageInput" accept="image/*">
              <button type="button" class="btn btn-outline-primary" id="selectImageBtn">
                <i class="bi bi-upload me-1"></i> Select Image
              </button>
            </div>
            <div class="form-text mb-3">
              Supported formats: JPG, JPEG, PNG, GIF. Max size: 2MB.
            </div>
            <div class="mt-3">
              <button type="submit" class="btn btn-primary" id="uploadImageBtn" disabled>
                <i class="bi bi-cloud-upload me-1"></i> Upload Image
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Personal Information Modal -->
  <div class="modal fade" id="personalInfoModal" tabindex="-1" aria-labelledby="personalInfoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="personalInfoModalLabel">
            <i class="bi bi-person-vcard"></i>Edit Personal Information
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="personalInfoForm" data-form-type="profile">
            <div class="row mb-3">
              <div class="col-md-6 mb-3 mb-md-0">
                <label for="first_name" class="form-label">First Name</label>
                <input type="text" class="form-control" id="first_name" name="first_name" value="<?php echo $profile_data['first_name']; ?>" required>
              </div>
              <div class="col-md-6">
                <label for="last_name" class="form-label">Last Name</label>
                <input type="text" class="form-control" id="last_name" name="last_name" value="<?php echo $profile_data['last_name']; ?>" required>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6 mb-3 mb-md-0">
                <label for="birthday" class="form-label">Birthday</label>
                <input type="date" class="form-control" id="birthday" name="birthday" value="<?php echo $profile_data['birthday']; ?>" required>
              </div>
              <div class="col-md-6">
                <label for="nationality" class="form-label">Nationality</label>
                <input type="text" class="form-control" id="nationality" name="nationality" value="<?php echo $profile_data['nationality']; ?>" required>
              </div>
            </div>
            <div class="mb-3">
              <label for="phone" class="form-label">Phone Number</label>
              <input type="tel" class="form-control" id="phone" name="phone" value="<?php echo $profile_data['phone']; ?>" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="savePersonalInfoBtn">Save Changes</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Business Information Modal -->
  <div class="modal fade" id="businessInfoModal" tabindex="-1" aria-labelledby="businessInfoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="businessInfoModalLabel">
            <i class="bi bi-shop"></i>Edit Business Information
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="businessInfoForm" data-form-type="profile">
            <div class="row mb-3">
              <div class="col-md-6 mb-3 mb-md-0">
                <label for="business_name" class="form-label">Business Name</label>
                <input type="text" class="form-control" id="business_name" name="business_name" value="<?php echo $profile_data['business_name']; ?>" required>
              </div>
              <div class="col-md-6">
                <label for="business_type" class="form-label">Business Type</label>
                <select class="form-select" id="business_type" name="business_type">
                  <option value="0" <?php echo $profile_data['business_type'] == 0 ? 'selected' : ''; ?>>Retail Store</option>
                  <option value="1" <?php echo $profile_data['business_type'] == 1 ? 'selected' : ''; ?>>Wholesale</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label for="business_address" class="form-label">Business Address</label>
              <textarea class="form-control" id="business_address" name="business_address" rows="3" required><?php echo $profile_data['business_address']; ?></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="saveBusinessInfoBtn">Save Changes</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Social Media Modal -->
  <div class="modal fade" id="socialMediaModal" tabindex="-1" aria-labelledby="socialMediaModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="socialMediaModalLabel">
            <i class="bi bi-share"></i>Edit Social Media
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="socialMediaForm" data-form-type="profile">
            <div class="mb-3">
              <label for="facebook" class="form-label">Facebook</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-facebook"></i></span>
                <input type="text" class="form-control" id="facebook" name="facebook" value="<?php echo $profile_data['facebook']; ?>" placeholder="Your Facebook profile or page">
              </div>
            </div>
            <div class="mb-3">
              <label for="instagram" class="form-label">Instagram</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-instagram"></i></span>
                <input type="text" class="form-control" id="instagram" name="instagram" value="<?php echo $profile_data['instagram']; ?>" placeholder="Your Instagram handle">
              </div>
            </div>
            <div class="mb-3">
              <label for="tiktok" class="form-label">TikTok</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-tiktok"></i></span>
                <input type="text" class="form-control" id="tiktok" name="tiktok" value="<?php echo $profile_data['tiktok']; ?>" placeholder="Your TikTok handle">
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="saveSocialMediaBtn">Save Changes</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Logout Confirmation Modal -->
  <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="logoutModalLabel">Confirm Logout</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to logout?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="confirmLogout">Logout</button>
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
  <script src="script.js"></script>
  <!-- Profile specific JavaScript -->
  <script src="profile.js"></script>
</body>
</html>

<?php
// Helper functions

/**
 * Get status class for order status
 * 
 * @param string $status Order status
 * @return string CSS class
 */
function getStatusClass($status) {
    switch (strtolower($status)) {
        case 'pending':
            return 'text-warning';
        case 'processing':
            return 'text-info';
        case 'shipped':
            return 'text-primary';
        case 'delivered':
            return 'text-success';
        case 'cancelled':
            return 'text-danger';
        default:
            return 'text-muted';
    }
}

/**
 * Get icon class for activity type
 * 
 * @param string $type Activity type
 * @return string Icon class
 */
function getActivityIcon($type) {
    switch (strtolower($type)) {
        case 'order':
            return 'bi-cart-check';
        case 'profile':
            return 'bi-person';
        case 'login':
            return 'bi-box-arrow-in-right';
        case 'account':
            return 'bi-shield-lock';
        default:
            return 'bi-clock-history';
    }
}

/**
 * Get time ago string
 * 
 * @param string $datetime Date and time
 * @return string Time ago string
 */
function getTimeAgo($datetime) {
    $time = strtotime($datetime);
    $now = time();
    $diff = $now - $time;
    
    if ($diff < 60) {
        return 'Just now';
    } elseif ($diff < 3600) {
        $mins = floor($diff / 60);
        return $mins . ' minute' . ($mins > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 86400) {
        $hours = floor($diff / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 604800) {
        $days = floor($diff / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 2592000) {
        $weeks = floor($diff / 604800);
        return $weeks . ' week' . ($weeks > 1 ? 's' : '') . ' ago';
    } else {
        return date('M j, Y', $time);
    }
}
?>
