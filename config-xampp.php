<?php
/**
 * CBT Sekolah - Konfigurasi untuk XAMPP Localhost
 * File ini berisi konfigurasi database dan aplikasi untuk environment XAMPP
 */

// Database Configuration untuk XAMPP
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'cbt_sekolah_db');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', ''); // XAMPP default: no password
define('DB_CHARSET', 'utf8mb4');

// Application Configuration
define('APP_NAME', 'CBT Sekolah');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'local');
define('APP_DEBUG', true);
define('APP_URL', 'http://localhost/cbt-sekolah');
define('APP_TIMEZONE', 'Asia/Jakarta');

// File Upload Configuration
define('UPLOAD_MAX_SIZE', 50 * 1024 * 1024); // 50MB
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);
define('UPLOAD_PATH', __DIR__ . '/uploads/');

// Session Configuration
define('SESSION_NAME', 'cbt_sekolah_session');
define('SESSION_LIFETIME', 7200); // 2 hours
define('SESSION_PATH', __DIR__ . '/sessions/');

// Logging Configuration
define('LOG_PATH', __DIR__ . '/logs/');
define('LOG_LEVEL', 'debug'); // debug, info, warning, error

// Security Configuration
define('CSRF_TOKEN_NAME', 'cbt_csrf_token');
define('PASSWORD_SALT', 'cbt_sekolah_salt_2024');
define('JWT_SECRET', 'cbt_sekolah_jwt_secret_2024');

// Email Configuration (untuk testing, bisa gunakan Mailtrap)
define('MAIL_HOST', 'smtp.mailtrap.io');
define('MAIL_PORT', 2525);
define('MAIL_USERNAME', 'your_mailtrap_username');
define('MAIL_PASSWORD', 'your_mailtrap_password');
define('MAIL_ENCRYPTION', 'tls');
define('MAIL_FROM_ADDRESS', 'noreply@cbt-sekolah.local');
define('MAIL_FROM_NAME', 'CBT Sekolah');

// Cache Configuration
define('CACHE_PATH', __DIR__ . '/cache/');
define('CACHE_LIFETIME', 3600); // 1 hour

// Exam Configuration
define('EXAM_TIME_LIMIT', 120); // 2 hours in minutes
define('EXAM_QUESTIONS_PER_PAGE', 10);
define('EXAM_AUTO_SUBMIT', true);

// File Paths
define('ROOT_PATH', __DIR__);
define('ASSETS_PATH', __DIR__ . '/assets/');
define('TEMPLATES_PATH', __DIR__ . '/templates/');
define('INCLUDES_PATH', __DIR__ . '/includes/');

// Error Reporting (untuk development)
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
}

// Timezone
date_default_timezone_set(APP_TIMEZONE);

// Database Connection Function
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USERNAME, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        if (APP_DEBUG) {
            die("Database connection failed: " . $e->getMessage());
        } else {
            die("Database connection failed. Please check your configuration.");
        }
    }
}

// Utility Functions
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function generateCSRFToken() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

function validateCSRFToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

function logMessage($level, $message, $context = []) {
    $logFile = LOG_PATH . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] [$level] $message";
    
    if (!empty($context)) {
        $logEntry .= " Context: " . json_encode($context);
    }
    
    $logEntry .= PHP_EOL;
    
    if (!is_dir(LOG_PATH)) {
        mkdir(LOG_PATH, 0755, true);
    }
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

function createDirectories() {
    $directories = [
        UPLOAD_PATH,
        LOG_PATH,
        CACHE_PATH,
        SESSION_PATH,
        ASSETS_PATH,
        TEMPLATES_PATH,
        INCLUDES_PATH
    ];
    
    foreach ($directories as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}

// Initialize application
session_name(SESSION_NAME);
session_start();
createDirectories();

// Set session lifetime
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
ini_set('session.cookie_lifetime', SESSION_LIFETIME);

// Log application start
logMessage('info', 'Application started', [
    'version' => APP_VERSION,
    'environment' => APP_ENV,
    'url' => $_SERVER['REQUEST_URI'] ?? 'unknown'
]);
?>