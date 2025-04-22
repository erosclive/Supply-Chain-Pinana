<?php
// Start session
session_start();

// Include database connection
require_once 'connection_db.php';

// Initialize variables
$error = "";
$username = "";

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get username and password from form
    $username = trim($_POST["username"]);
    $password = $_POST["password"];
    
    // Validate input
    if (empty($username) || empty($password)) {
        $error = "Please enter both username and password.";
    } else {
        // Prepare SQL statement to prevent SQL injection
        $stmt = mysqli_prepare($conn, "SELECT id, username, password, role, full_name FROM users WHERE username = ? AND is_active = 1");
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        // Check if user exists
        if (mysqli_num_rows($result) == 1) {
            $user = mysqli_fetch_assoc($result);
            
            // Verify password
            if (password_verify($password, $user["password"])) {
                // Password is correct, set session variables
                $_SESSION["user_id"] = $user["id"];
                $_SESSION["username"] = $user["username"];
                $_SESSION["role"] = $user["role"];
                $_SESSION["full_name"] = $user["full_name"];
                $_SESSION["logged_in"] = true;
                
                // Update last login time
                $update_stmt = mysqli_prepare($conn, "UPDATE users SET last_login = NOW() WHERE id = ?");
                mysqli_stmt_bind_param($update_stmt, "i", $user["id"]);
                mysqli_stmt_execute($update_stmt);
                mysqli_stmt_close($update_stmt);
                
                // Redirect to dashboard
                header("Location: dashboard.html");
                exit();
            } else {
                $error = "Invalid username or password.";
            }
        } else {
            $error = "Invalid username or password.";
        }
        
        mysqli_stmt_close($stmt);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Piñana Gourmet - Sign In</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        :root {
            --pinana-yellow: #f2d045;
            --pinana-green: #0b7a3e;
            --pinana-light-yellow: #fff5d6;
        }

        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-container {
            width: 100%;
            height: 100vh;
            position: relative;
            overflow: hidden;
        }

        .background-circle {
            position: absolute;
            width: 800px;
            height: 800px;
            border-radius: 50%;
            background-color: var(--pinana-light-yellow);
            bottom: -400px;
            left: -200px;
            z-index: -1;
        }

        .logo-container {
            position: relative;
            width: 50%;
            height: 100%;
        }

        .logo {
            position: absolute;
            top: 30px;
            left: 30px;
            width: 120px;
        }

        .pineapple-large {
            position: absolute;
            left: -200px; /* Adjusted to extend beyond screen */
            bottom: -200px;
            width: 120%; /* Made wider to extend beyond container */
            z-index: 0;
            overflow: visible;
        }

        .square-light-img {
            width: 1000px; /* Made bigger */
            opacity: 0.8; /* Decreased opacity */
        }

        .icon-cup {
            position: absolute;
            top: 200px;
            left: 180px;
            color: var(--pinana-yellow);
            font-size: 24px;
        }

        .icon-bulb {
            position: absolute;
            bottom: 200px;
            left: 400px;
            color: var(--pinana-yellow);
            font-size: 24px;
        }

        .login-form-container {
            width: 400px;
            padding: 40px;
            border-radius: 8px;
            border: 1px solid #ddbd3e;
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .login-form-container h2 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 30px;
            text-align: center;
        }

        .form-control {
            height: 50px;
            padding: 10px 15px;
            border-radius: 4px;
            background-color: #f5f5f5;
            border: 1px solid #e0e0e0;
        }
        
        /* Fix for the input group */
        .input-group .form-control {
            margin-bottom: 0;
        }
        
        /* Add margin to the input group instead */
        .input-group {
            margin-bottom: 20px;
        }

        .form-label {
            font-weight: 500;
            color: #333;
        }

        .btn-primary {
            background-color: var(--pinana-yellow);
            border-color: var(--pinana-yellow);
            width: 100%;
            height: 50px;
            font-weight: 600;
            color: #333;
        }

        .btn-primary:hover {
            background-color: #e0c040;
            border-color: #e0c040;
        }

        .btn-staff {
            background-color: var(--pinana-yellow);
            border-color: var(--pinana-yellow);
            color: #333;
            font-weight: 500;
            padding: 8px 20px;
            position: absolute;
            top: 30px;
            right: 30px;
            z-index: 10;
        }

        .btn-staff:hover {
            background-color: #e0c040;
            border-color: #e0c040;
        }

        .forgot-password {
            color: #4A5AEF;
            text-decoration: none;
            font-size: 14px;
        }

        .forgot-password:hover {
            text-decoration: underline;
        }

        .form-check-input:checked {
            background-color: var(--pinana-yellow);
            border-color: var(--pinana-yellow);
        }

        .form-check-input:focus {
            border-color: var(--pinana-yellow);
            box-shadow: 0 0 0 0.25rem rgba(242, 208, 69, 0.25);
        }

        .form-area {
            position: absolute;
            top: 0;
            right: 0;
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .error-message {
            color: #dc3545;
            margin-bottom: 15px;
            text-align: center;
        }

        @media (max-width: 992px) {
            .logo-container {
                display: none;
            }
            .form-area {
                width: 100%;
                padding: 20px;
            }
            .background-circle {
                width: 600px;
                height: 600px;
                bottom: -300px;
                left: 50%;
                transform: translateX(-50%);
            }
            .login-form-container {
                width: 100%;
                max-width: 400px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="background-circle"></div>
        
        <!-- Logo and decorative elements -->
        <div class="logo-container d-none d-lg-block">
            <img src="images/final-dark.png" alt="Piñana Gourmet" class="logo">
            <div class="pineapple-large">
               <img src="images/square-light.png" alt="" class="square-light-img">
            </div>
            <div class="icon-cup">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 0a2 2 0 0 0-2 2v7h1V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v7h1V2a2 2 0 0 0-2-2H4Z"/>
                    <path d="M4 11v5h1v-5H4Zm6 0v5h1v-5h-1Z"/>
                </svg>
            </div>
            <div class="icon-bulb">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1z"/>
                </svg>
            </div>
        </div>
        
        <!-- Sign in form -->
        <div class="form-area">
            <div class="login-form-container">
                <h2>Sign in</h2>
                <?php if (!empty($error)): ?>
                    <div class="error-message"><?php echo $error; ?></div>
                <?php endif; ?>
                <form id="loginForm" method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username" name="username" placeholder="Enter your username" value="<?php echo htmlspecialchars($username); ?>" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <div class="input-group">
                            <input type="password" class="form-control" id="password" name="password" placeholder="Enter your password" required>
                            <span class="input-group-text" id="togglePassword" style="cursor: pointer; background-color: #f5f5f5; border: 1px solid #e0e0e0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rememberMe" name="rememberMe">
                            <label class="form-check-label" for="rememberMe">
                                Remember me
                            </label>
                        </div>
                        <a href="#" class="forgot-password">Forgot password?</a>
                    </div>
                    <button type="submit" class="btn btn-primary">Sign in</button>
                </form>
            </div>
        </div>
        
        <!-- Staff button -->
        <a href="#" class="btn btn-staff">Apply as Staff</a>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Password visibility toggle
            const togglePassword = document.querySelector('#togglePassword');
            const password = document.querySelector('#password');
            
            togglePassword.addEventListener('click', function() {
                // Toggle the type attribute
                const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                password.setAttribute('type', type);
                
                // Toggle the eye icon
                this.innerHTML = type === 'password' ? 
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>' : 
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>';
            });
        });
    </script>
</body>
</html>