<?php
/**
 * CBT Sekolah - Database Setup untuk XAMPP
 * Script ini untuk setup database dan tabel-tabel yang diperlukan
 */

// Include configuration
require_once 'config-xampp.php';

echo "<h1>CBT Sekolah - Database Setup</h1>";
echo "<p>Setting up database for XAMPP localhost...</p>";

try {
    // Connect to MySQL without database (to create database)
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=" . DB_CHARSET, DB_USERNAME, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ Connected to MySQL successfully</p>";
    
    // Create database if not exists
    $sql = "CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    $pdo->exec($sql);
    echo "<p>✅ Database '" . DB_NAME . "' created/verified successfully</p>";
    
    // Select the database
    $pdo->exec("USE `" . DB_NAME . "`");
    echo "<p>✅ Database selected successfully</p>";
    
    // Create tables
    $tables = [
        // Users table
        "CREATE TABLE IF NOT EXISTS `users` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `username` varchar(50) NOT NULL UNIQUE,
            `email` varchar(100) NOT NULL UNIQUE,
            `password` varchar(255) NOT NULL,
            `full_name` varchar(100) NOT NULL,
            `role` enum('admin','guru','siswa') NOT NULL DEFAULT 'siswa',
            `nis_nip` varchar(20) DEFAULT NULL,
            `kelas` varchar(10) DEFAULT NULL,
            `jurusan` varchar(50) DEFAULT NULL,
            `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
            `last_login` datetime DEFAULT NULL,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_username` (`username`),
            KEY `idx_email` (`email`),
            KEY `idx_role` (`role`),
            KEY `idx_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Subjects table
        "CREATE TABLE IF NOT EXISTS `subjects` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(100) NOT NULL,
            `code` varchar(20) NOT NULL UNIQUE,
            `description` text,
            `grade_level` varchar(10) NOT NULL,
            `semester` enum('1','2') NOT NULL,
            `credits` int(2) DEFAULT 1,
            `status` enum('active','inactive') NOT NULL DEFAULT 'active',
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_code` (`code`),
            KEY `idx_grade_level` (`grade_level`),
            KEY `idx_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Exams table
        "CREATE TABLE IF NOT EXISTS `exams` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `title` varchar(200) NOT NULL,
            `subject_id` int(11) NOT NULL,
            `description` text,
            `duration` int(3) NOT NULL COMMENT 'Duration in minutes',
            `total_questions` int(3) NOT NULL DEFAULT 0,
            `passing_score` int(3) NOT NULL DEFAULT 70,
            `start_time` datetime NOT NULL,
            `end_time` datetime NOT NULL,
            `status` enum('draft','published','active','completed','archived') NOT NULL DEFAULT 'draft',
            `created_by` int(11) NOT NULL,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_subject_id` (`subject_id`),
            KEY `idx_status` (`status`),
            KEY `idx_start_time` (`start_time`),
            KEY `idx_end_time` (`end_time`),
            FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Questions table
        "CREATE TABLE IF NOT EXISTS `questions` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `exam_id` int(11) NOT NULL,
            `question_text` text NOT NULL,
            `question_type` enum('multiple_choice','essay','true_false') NOT NULL DEFAULT 'multiple_choice',
            `points` int(2) NOT NULL DEFAULT 1,
            `order_number` int(3) NOT NULL DEFAULT 0,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_exam_id` (`exam_id`),
            KEY `idx_question_type` (`question_type`),
            KEY `idx_order_number` (`order_number`),
            FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Question options table
        "CREATE TABLE IF NOT EXISTS `question_options` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `question_id` int(11) NOT NULL,
            `option_text` varchar(500) NOT NULL,
            `is_correct` tinyint(1) NOT NULL DEFAULT 0,
            `order_number` int(2) NOT NULL DEFAULT 0,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_question_id` (`question_id`),
            KEY `idx_is_correct` (`is_correct`),
            FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Exam sessions table
        "CREATE TABLE IF NOT EXISTS `exam_sessions` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `exam_id` int(11) NOT NULL,
            `user_id` int(11) NOT NULL,
            `start_time` datetime NOT NULL,
            `end_time` datetime DEFAULT NULL,
            `score` decimal(5,2) DEFAULT NULL,
            `status` enum('started','in_progress','completed','timeout','abandoned') NOT NULL DEFAULT 'started',
            `ip_address` varchar(45) DEFAULT NULL,
            `user_agent` text,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `unique_exam_user` (`exam_id`, `user_id`),
            KEY `idx_exam_id` (`exam_id`),
            KEY `idx_user_id` (`user_id`),
            KEY `idx_status` (`status`),
            FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // User answers table
        "CREATE TABLE IF NOT EXISTS `user_answers` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `exam_session_id` int(11) NOT NULL,
            `question_id` int(11) NOT NULL,
            `selected_option_id` int(11) DEFAULT NULL,
            `essay_answer` text,
            `is_correct` tinyint(1) DEFAULT NULL,
            `points_earned` decimal(5,2) DEFAULT 0,
            `answered_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `unique_session_question` (`exam_session_id`, `question_id`),
            KEY `idx_exam_session_id` (`exam_session_id`),
            KEY `idx_question_id` (`question_id`),
            KEY `idx_is_correct` (`is_correct`),
            FOREIGN KEY (`exam_session_id`) REFERENCES `exam_sessions`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`selected_option_id`) REFERENCES `question_options`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Materials table
        "CREATE TABLE IF NOT EXISTS `materials` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `title` varchar(200) NOT NULL,
            `subject_id` int(11) NOT NULL,
            `description` text,
            `file_path` varchar(500) DEFAULT NULL,
            `file_size` bigint(20) DEFAULT NULL,
            `file_type` varchar(100) DEFAULT NULL,
            `uploaded_by` int(11) NOT NULL,
            `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_subject_id` (`subject_id`),
            KEY `idx_uploaded_by` (`uploaded_by`),
            KEY `idx_status` (`status`),
            FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Assignments table
        "CREATE TABLE IF NOT EXISTS `assignments` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `title` varchar(200) NOT NULL,
            `subject_id` int(11) NOT NULL,
            `description` text,
            `due_date` datetime NOT NULL,
            `max_score` int(3) NOT NULL DEFAULT 100,
            `created_by` int(11) NOT NULL,
            `status` enum('draft','published','active','completed','archived') NOT NULL DEFAULT 'draft',
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_subject_id` (`subject_id`),
            KEY `idx_created_by` (`created_by`),
            KEY `idx_status` (`status`),
            KEY `idx_due_date` (`due_date`),
            FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Assignment submissions table
        "CREATE TABLE IF NOT EXISTS `assignment_submissions` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `assignment_id` int(11) NOT NULL,
            `user_id` int(11) NOT NULL,
            `file_path` varchar(500) DEFAULT NULL,
            `submission_text` text,
            `score` decimal(5,2) DEFAULT NULL,
            `feedback` text,
            `submitted_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `graded_at` timestamp NULL DEFAULT NULL,
            `graded_by` int(11) DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `unique_assignment_user` (`assignment_id`, `user_id`),
            KEY `idx_assignment_id` (`assignment_id`),
            KEY `idx_user_id` (`user_id`),
            KEY `idx_submitted_at` (`submitted_at`),
            FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`graded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    ];
    
    // Execute table creation
    foreach ($tables as $sql) {
        $pdo->exec($sql);
    }
    echo "<p>✅ All tables created successfully</p>";
    
    // Insert sample data
    echo "<p>📝 Inserting sample data...</p>";
    
    // Insert admin user
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $adminSql = "INSERT IGNORE INTO `users` (`username`, `email`, `password`, `full_name`, `role`, `nis_nip`) 
                  VALUES ('admin', 'admin@cbt-sekolah.local', ?, 'Administrator', 'admin', 'ADM001')";
    $stmt = $pdo->prepare($adminSql);
    $stmt->execute([$adminPassword]);
    echo "<p>✅ Admin user created (username: admin, password: admin123)</p>";
    
    // Insert sample subjects
    $subjects = [
        ['Matematika', 'MTK', 'Mata pelajaran matematika untuk tingkat SMA', 'X', '1'],
        ['Bahasa Indonesia', 'BIN', 'Mata pelajaran bahasa Indonesia', 'X', '1'],
        ['Bahasa Inggris', 'BIG', 'Mata pelajaran bahasa Inggris', 'X', '1'],
        ['Fisika', 'FIS', 'Mata pelajaran fisika', 'X', '1'],
        ['Kimia', 'KIM', 'Mata pelajaran kimia', 'X', '1']
    ];
    
    $subjectSql = "INSERT IGNORE INTO `subjects` (`name`, `code`, `description`, `grade_level`, `semester`) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($subjectSql);
    
    foreach ($subjects as $subject) {
        $stmt->execute($subject);
    }
    echo "<p>✅ Sample subjects created</p>";
    
    // Insert sample teacher
    $teacherPassword = password_hash('guru123', PASSWORD_DEFAULT);
    $teacherSql = "INSERT IGNORE INTO `users` (`username`, `email`, `password`, `full_name`, `role`, `nis_nip`) 
                    VALUES ('guru', 'guru@cbt-sekolah.local', ?, 'Guru Matematika', 'guru', 'GRU001')";
    $stmt = $pdo->prepare($teacherSql);
    $stmt->execute([$teacherPassword]);
    echo "<p>✅ Sample teacher created (username: guru, password: guru123)</p>";
    
    // Insert sample student
    $studentPassword = password_hash('siswa123', PASSWORD_DEFAULT);
    $studentSql = "INSERT IGNORE INTO `users` (`username`, `email`, `password`, `full_name`, `role`, `nis_nip`, `kelas`, `jurusan`) 
                    VALUES ('siswa', 'siswa@cbt-sekolah.local', ?, 'Siswa Contoh', 'siswa', 'SIS001', 'X-1', 'IPA')";
    $stmt = $pdo->prepare($studentSql);
    $stmt->execute([$studentPassword]);
    echo "<p>✅ Sample student created (username: siswa, password: siswa123)</p>";
    
    echo "<h2>🎉 Database setup completed successfully!</h2>";
    echo "<h3>Default Login Credentials:</h3>";
    echo "<ul>";
    echo "<li><strong>Admin:</strong> username: admin, password: admin123</li>";
    echo "<li><strong>Guru:</strong> username: guru, password: guru123</li>";
    echo "<li><strong>Siswa:</strong> username: siswa, password: siswa123</li>";
    echo "</ul>";
    echo "<p><a href='index.html'>Go to Application</a></p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Database setup failed: " . $e->getMessage() . "</p>";
    echo "<p>Please check your XAMPP MySQL configuration.</p>";
}
?>