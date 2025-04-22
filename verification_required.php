<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Required - Piñana Gourmet</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        :root {
            --pinana-yellow: #f2d045;
            --pinana-green: #0b7a3e;
            --pinana-light-yellow: #fff5d6;
        }
        
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .verification-container {
            max-width: 600px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
        }
        
        .warning-icon {
            font-size: 5rem;
            color: #ffc107;
            margin-bottom: 1.5rem;
        }
        
        h1 {
            color: #333;
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        p {
            color: #666;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }
        
        .btn-primary {
            background-color: var(--pinana-yellow);
            border-color: var(--pinana-yellow);
            color: #333;
            font-weight: 600;
            padding: 10px 25px;
            font-size: 1.1rem;
        }
        
        .btn-primary:hover {
            background-color: #e0c040;
            border-color: #e0c040;
        }
        
        .logo {
            width: 150px;
            margin-bottom: 20px;
        }
        
        .email-highlight {
            font-weight: bold;
            color: #333;
            background-color: var(--pinana-light-yellow);
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="verification-container">
        <img src="images/final-light.png" alt="Piñana Gourmet" class="logo">
        
        <div class="warning-icon">
            <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        
        <h1>Email Verification Required</h1>
        
        <?php
        $email = isset($_GET['email']) ? htmlspecialchars($_GET['email']) : 'your email';
        ?>
        
        <p>Your account has been created, but you need to verify your email address before you can log in.</p>
        
        <p>We've sent a verification link to <span class="email-highlight"><?php echo $email; ?></span>. Please check your inbox and click the verification link to activate your account.</p>
        
        <p>If you don't see the email, please check your spam folder.</p>
        
        <div class="d-flex justify-content-center gap-3">
            <a href="index.html" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-2"></i>Back to Login
            </a>
            
            <a href="resend_verification.php" class="btn btn-primary">
                <i class="bi bi-envelope me-2"></i>Resend Verification Email
            </a>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
