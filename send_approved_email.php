﻿<?php
// 1) Start output buffering immediately to catch any stray BOM
ob_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

// ✅ Manual includes (same structure as your working file)
require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ✅ Use your working Gmail SMTP credentials
define('SMTP_USERNAME', 'pinyanagfp.scm@gmail.com');
define('SMTP_PASSWORD', 'yuiq iriu khmi qden');
define('SMTP_FROM_EMAIL', 'pinyanagfp.scm@gmail.com');
define('SMTP_FROM_NAME', 'Pinana Gourmet');

require 'config.php'; // or db_connection.php

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input or empty request body.']);
    exit;
}

$required = ['user_id', 'to_email', 'from_email', 'subject', 'message', 'retailer_name'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

$userId       = $data['user_id'];
$toEmail      = $data['to_email'];
$fromEmail    = $data['from_email'];
$subject      = $data['subject'];
$message      = $data['message'];
$retailerName = $data['retailer_name'];

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$conn->begin_transaction();

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Optional: allow self-signed certs (for local testing)
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ]
    ];

    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress($toEmail, $retailerName);
    $mail->Subject = $subject;
    $mail->Body    = $message;
    $mail->isHTML(false);

    $mail->send();

    // ✅ Update user status in users table
    $stmt = $conn->prepare("
        UPDATE users 
           SET approval_status = 'approved', is_active = 1 
         WHERE id = ?
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();

    // ✅ Update retailer_profiles table as well
    $stmt = $conn->prepare("
        UPDATE retailer_profiles 
           SET approval_status = 'approved', updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();

    // ✅ Log the approval email
    $emailType = 'approval';
    $stmt = $conn->prepare("
        INSERT INTO email_logs 
            (user_id, to_email, from_email, subject, message, email_type) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("isssss", $userId, $toEmail, $fromEmail, $subject, $message, $emailType);
    $stmt->execute();
    $stmt->close();

    $conn->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error processing approval: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}

// 2) Register a shutdown handler to strip any leading BOM from the buffered output
register_shutdown_function(function() {
    $output = ob_get_clean();
    if (substr($output, 0, 3) === "\xEF\xBB\xBF") {
        $output = substr($output, 3);
    }
    echo $output;
});
