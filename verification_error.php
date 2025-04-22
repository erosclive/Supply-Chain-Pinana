<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Error - Piñana Gourmet</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
        .verification-container {
            max-width: 600px;
            margin: 80px auto;
            padding: 40px;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            text-align: center;
        }
        .error-icon {
            font-size: 80px;
            color: #dc3545;
            margin-bottom: 20px;
        }
        .verification-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #212529;
        }
        .verification-message {
            font-size: 16px;
            color: #6c757d;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .btn-primary {
            background-color: #0d6efd;
            border-color: #0d6efd;
            padding: 10px 24px;
            font-weight: 500;
            border-radius: 6px;
        }
        .btn-primary:hover {
            background-color: #0b5ed7;
            border-color: #0a58ca;
        }
        .logo {
            max-width: 180px;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="verification-container">
            <img src="images/final-light.png" alt="Piñana Gourmet Logo" class="logo">
            <div class="error-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            
            <?php
            $error = isset($_GET['error']) ? $_GET['error'] : 'unknown';
            $title = 'Verification Error';
            $message = 'An unknown error occurred during the verification process.';
            
            if ($error === 'no_token') {
                $title = 'Missing Verification Token';
                $message = 'The verification link is invalid. Please make sure you clicked the complete link from the email.';
            } elseif ($error === 'invalid_token') {
                $title = 'Invalid Verification Token';
                $message = 'The verification link is invalid or has already been used. Please request a new verification email if needed.';
            } elseif ($error === 'token_expired') {
                $title = 'Verification Link Expired';
                $message = 'Your verification link has expired. Please request a new verification email.';
            } elseif ($error === 'system_error') {
                $title = 'System Error';
                $message = 'A system error occurred during the verification process. Please try again later or contact support.';
            }
            ?>
            
            <h1 class="verification-title"><?php echo $title; ?></h1>
            <p class="verification-message">
                <?php echo $message; ?>
            </p>
            <div class="d-flex justify-content-center gap-3">
                <a href="index.html" class="btn btn-primary">Go to Login</a>
                <a href="resend_verification.php" class="btn btn-outline-primary">Resend Verification Email</a>
            </div>
        </div>
    </div>

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
</body>
</html>
