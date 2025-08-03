<?php
class Database {
    private static $instance = null;
    private $connection;

    // Database configuration
    private $host = 'localhost';
    private $database = 'gym_management';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';

    private function __construct() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    // Prevent cloning of the instance
    private function __clone() {}

    // Prevent unserializing of the instance
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// Create database tables if they don't exist
function initializeDatabase() {
    try {
        $db = Database::getInstance()->getConnection();
        
        // Create owners table
        $db->exec("
            CREATE TABLE IF NOT EXISTS owners (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(100) NOT NULL UNIQUE,
                phoneNumber VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                activeStatus TINYINT(1) DEFAULT 1,
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updateTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create users table
        $db->exec("
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(100) NOT NULL UNIQUE,
                phoneNumber VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                activeStatus TINYINT(1) DEFAULT 1,
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updateTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create gyms table
        $db->exec("
            CREATE TABLE IF NOT EXISTS gyms (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                address VARCHAR(500) NOT NULL,
                city VARCHAR(100),
                state VARCHAR(100),
                zipCode VARCHAR(20),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                rating DECIMAL(2,1) DEFAULT 0.0,
                capacity INT DEFAULT 0,
                currentOccupancy INT DEFAULT 0,
                ownerId VARCHAR(36) NOT NULL,
                activeStatus TINYINT(1) DEFAULT 1,
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updateTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (ownerId) REFERENCES owners(id) ON DELETE CASCADE,
                INDEX idx_owner (ownerId),
                INDEX idx_location (latitude, longitude),
                INDEX idx_active (activeStatus)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create gym_images table
        $db->exec("
            CREATE TABLE IF NOT EXISTS gym_images (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                gymId VARCHAR(36) NOT NULL,
                imageUrl VARCHAR(500) NOT NULL,
                isPrimary TINYINT(1) DEFAULT 0,
                sortOrder INT DEFAULT 0,
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gymId) REFERENCES gyms(id) ON DELETE CASCADE,
                INDEX idx_gym (gymId),
                INDEX idx_primary (isPrimary)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create gym_amenities table
        $db->exec("
            CREATE TABLE IF NOT EXISTS gym_amenities (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                gymId VARCHAR(36) NOT NULL,
                amenityName VARCHAR(100) NOT NULL,
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (gymId) REFERENCES gyms(id) ON DELETE CASCADE,
                INDEX idx_gym (gymId),
                UNIQUE KEY unique_gym_amenity (gymId, amenityName)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create gym_operating_hours table
        $db->exec("
            CREATE TABLE IF NOT EXISTS gym_operating_hours (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                gymId VARCHAR(36) NOT NULL,
                openTime TIME NOT NULL,
                closeTime TIME NOT NULL,
                dayOfWeek TINYINT(1) DEFAULT 0 COMMENT '0=All days, 1=Monday, 2=Tuesday, etc.',
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updateTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (gymId) REFERENCES gyms(id) ON DELETE CASCADE,
                INDEX idx_gym (gymId),
                UNIQUE KEY unique_gym_day (gymId, dayOfWeek)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create gym_plans table
        $db->exec("
            CREATE TABLE IF NOT EXISTS gym_plans (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                gymId VARCHAR(36) NOT NULL,
                planName VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                duration INT NOT NULL COMMENT 'Duration in days',
                planType ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
                activeStatus TINYINT(1) DEFAULT 1,
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updateTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (gymId) REFERENCES gyms(id) ON DELETE CASCADE,
                INDEX idx_gym (gymId),
                INDEX idx_type (planType),
                INDEX idx_active (activeStatus)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create user_subscriptions table
        $db->exec("
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                userId VARCHAR(36) NOT NULL,
                gymId VARCHAR(36) NOT NULL,
                planId VARCHAR(36) NOT NULL,
                startDate DATE NOT NULL,
                endDate DATE NOT NULL,
                status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
                amountPaid DECIMAL(10,2) NOT NULL,
                paymentMethod VARCHAR(50),
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updateTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (gymId) REFERENCES gyms(id) ON DELETE CASCADE,
                FOREIGN KEY (planId) REFERENCES gym_plans(id) ON DELETE CASCADE,
                INDEX idx_user (userId),
                INDEX idx_gym (gymId),
                INDEX idx_plan (planId),
                INDEX idx_status (status),
                INDEX idx_dates (startDate, endDate)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create attendance table
        $db->exec("
            CREATE TABLE IF NOT EXISTS attendance (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                userId VARCHAR(36) NOT NULL,
                gymId VARCHAR(36) NOT NULL,
                checkIn TIMESTAMP NOT NULL,
                checkOut TIMESTAMP NULL,
                date DATE NOT NULL,
                duration INT NULL COMMENT 'Duration in seconds',
                method ENUM('qr', 'code', 'manual') NOT NULL,
                qrCode VARCHAR(100) NULL,
                latitude DECIMAL(10, 8) NULL,
                longitude DECIMAL(11, 8) NULL,
                createTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (gymId) REFERENCES gyms(id) ON DELETE CASCADE,
                INDEX idx_user (userId),
                INDEX idx_gym (gymId),
                INDEX idx_date (date),
                INDEX idx_checkin (checkIn),
                INDEX idx_method (method)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        return true;
    } catch (Exception $e) {
        error_log("Database initialization failed: " . $e->getMessage());
        return false;
    }
}

// Initialize database tables on first load
initializeDatabase();
?>
