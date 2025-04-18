<?php
// SMTP Configuration
// Replace these values with your actual SMTP settings

// Gmail SMTP settings example
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password'); // Use an app password for Gmail
define('SMTP_FROM_EMAIL', 'noreply@pinanagourmet.com');
define('SMTP_FROM_NAME', 'Piñana Gourmet');

// Uncomment and use these settings for Outlook/Office365
/*
define('SMTP_HOST', 'smtp.office365.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@outlook.com');
define('SMTP_PASSWORD', 'your-password');
define('SMTP_FROM_EMAIL', 'noreply@pinanagourmet.com');
define('SMTP_FROM_NAME', 'Piñana Gourmet');
*/

// Uncomment and use these settings for Yahoo Mail
/*
define('SMTP_HOST', 'smtp.mail.yahoo.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@yahoo.com');
define('SMTP_PASSWORD', 'your-password');
define('SMTP_FROM_EMAIL', 'noreply@pinanagourmet.com');
define('SMTP_FROM_NAME', 'Piñana Gourmet');
*/
?>
