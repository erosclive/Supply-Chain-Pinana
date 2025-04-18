<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to check if a file exists and is readable
function checkFile($filePath) {
    $result = [
        'exists' => file_exists($filePath),
        'readable' => is_readable($filePath),
        'writable' => is_writable($filePath),
        'permissions' => file_exists($filePath) ? substr(sprintf('%o', fileperms($filePath)), -4) : 'N/A',
        'path' => $filePath,
        'absolute_path' => file_exists($filePath) ? realpath($filePath) : 'N/A'
    ];
    
    return $result;
}

// Files to check
$filesToCheck = [
    'verify_email.php',
    'verification_success.php',
    'verification_error.php',
    'resend_verification.php',
    'send_email.php',
    'db_connection.php'
];

// Check each file
$results = [];
foreach ($filesToCheck as $file) {
    $results[$file] = checkFile($file);
}

// Check directory permissions
$directoryPermissions = [
    'current_directory' => [
        'path' => __DIR__,
        'readable' => is_readable(__DIR__),
        'writable' => is_writable(__DIR__),
        'permissions' => substr(sprintf('%o', fileperms(__DIR__)), -4)
    ]
];

// Get server information
$serverInfo = [
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown',
    'php_version' => PHP_VERSION,
    'os' => PHP_OS
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Permissions Check</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding: 20px;
        }
        .container {
            max-width: 900px;
        }
        .status-ok {
            color: #198754;
        }
        .status-error {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="my-4">File Permissions Check</h1>
        
        <div class="card mb-4">
            <div class="card-header">
                Server Information
            </div>
            <div class="card-body">
                <table class="table">
                    <tbody>
                        <?php foreach ($serverInfo as $key => $value): ?>
                            <tr>
                                <th style="width: 200px;"><?php echo ucwords(str_replace('_', ' ', $key)); ?></th>
                                <td><?php echo $value; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">
                Directory Permissions
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Directory</th>
                            <th>Readable</th>
                            <th>Writable</th>
                            <th>Permissions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($directoryPermissions as $dir => $info): ?>
                            <tr>
                                <td><?php echo $info['path']; ?></td>
                                <td>
                                    <?php if ($info['readable']): ?>
                                        <span class="status-ok">Yes</span>
                                    <?php else: ?>
                                        <span class="status-error">No</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($info['writable']): ?>
                                        <span class="status-ok">Yes</span>
                                    <?php else: ?>
                                        <span class="status-error">No</span>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo $info['permissions']; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                File Permissions
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Exists</th>
                            <th>Readable</th>
                            <th>Writable</th>
                            <th>Permissions</th>
                            <th>Absolute Path</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($results as $file => $result): ?>
                            <tr>
                                <td><?php echo $file; ?></td>
                                <td>
                                    <?php if ($result['exists']): ?>
                                        <span class="status-ok">Yes</span>
                                    <?php else: ?>
                                        <span class="status-error">No</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($result['readable']): ?>
                                        <span class="status-ok">Yes</span>
                                    <?php else: ?>
                                        <span class="status-error">No</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($result['writable']): ?>
                                        <span class="status-ok">Yes</span>
                                    <?php else: ?>
                                        <span class="status-error">No</span>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo $result['permissions']; ?></td>
                                <td><?php echo $result['absolute_path']; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="mt-4">
            <a href="index.html" class="btn btn-primary">Back to Home</a>
        </div>
    </div>
</body>
</html>
