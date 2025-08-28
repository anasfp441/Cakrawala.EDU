<?php
/**
 * CBT Sekolah - Authentication API
 * API untuk login, logout, dan manajemen session
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config-xampp.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'login':
                        handleLogin($input);
                        break;
                    case 'logout':
                        handleLogout();
                        break;
                    case 'check_session':
                        checkSession();
                        break;
                    default:
                        sendResponse(400, 'Invalid action');
                }
            } else {
                sendResponse(400, 'Action parameter required');
            }
            break;
            
        case 'GET':
            if (isset($_GET['action'])) {
                switch ($_GET['action']) {
                    case 'check_session':
                        checkSession();
                        break;
                    default:
                        sendResponse(400, 'Invalid action');
                }
            } else {
                sendResponse(400, 'Action parameter required');
            }
            break;
            
        default:
            sendResponse(405, 'Method not allowed');
    }
} catch (Exception $e) {
    logMessage('error', 'API Error: ' . $e->getMessage());
    sendResponse(500, 'Internal server error');
}

/**
 * Handle user login
 */
function handleLogin($input) {
    if (!isset($input['username']) || !isset($input['password'])) {
        sendResponse(400, 'Username and password required');
    }
    
    $username = sanitizeInput($input['username']);
    $password = $input['password'];
    
    try {
        $pdo = getDBConnection();
        
        // Get user by username
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 'active'");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            sendResponse(401, 'Invalid username or password');
        }
        
        // Update last login
        $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        // Create session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['login_time'] = time();
        
        // Log successful login
        logMessage('info', 'User logged in successfully', [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        // Return user data (without password)
        unset($user['password']);
        sendResponse(200, 'Login successful', [
            'user' => $user,
            'session_id' => session_id()
        ]);
        
    } catch (PDOException $e) {
        logMessage('error', 'Database error during login: ' . $e->getMessage());
        sendResponse(500, 'Database error');
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    $userId = $_SESSION['user_id'] ?? null;
    $username = $_SESSION['username'] ?? 'unknown';
    
    // Log logout
    if ($userId) {
        logMessage('info', 'User logged out', [
            'user_id' => $userId,
            'username' => $username,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    }
    
    // Destroy session
    session_destroy();
    
    sendResponse(200, 'Logout successful');
}

/**
 * Check current session status
 */
function checkSession() {
    if (!isset($_SESSION['user_id'])) {
        sendResponse(401, 'Not authenticated');
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get current user data
        $stmt = $pdo->prepare("SELECT id, username, email, full_name, role, nis_nip, kelas, jurusan, status, last_login FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            session_destroy();
            sendResponse(401, 'User not found');
        }
        
        if ($user['status'] !== 'active') {
            session_destroy();
            sendResponse(401, 'Account is not active');
        }
        
        // Check session timeout (2 hours)
        $sessionTimeout = 2 * 60 * 60; // 2 hours in seconds
        if (time() - $_SESSION['login_time'] > $sessionTimeout) {
            session_destroy();
            sendResponse(401, 'Session expired');
        }
        
        // Update session time
        $_SESSION['login_time'] = time();
        
        sendResponse(200, 'Session valid', [
            'user' => $user,
            'session_id' => session_id(),
            'login_time' => date('Y-m-d H:i:s', $_SESSION['login_time'])
        ]);
        
    } catch (PDOException $e) {
        logMessage('error', 'Database error during session check: ' . $e->getMessage());
        sendResponse(500, 'Database error');
    }
}

/**
 * Send JSON response
 */
function sendResponse($statusCode, $message, $data = null) {
    http_response_code($statusCode);
    
    $response = [
        'success' => $statusCode >= 200 && $statusCode < 300,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit();
}
?>