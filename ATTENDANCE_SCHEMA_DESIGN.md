# Attendance System Database Schema Design

## New Models Required

### 1. Attendance Model
```sql
CREATE TABLE attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    gym_id INT NOT NULL,
    check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    check_in_method ENUM('gym_qr_scan', 'gym_code', 'quick_checkin', 'owner_scan_user', 'fingerprint', 'face_scan') NOT NULL DEFAULT 'quick_checkin',
    user_location_lat DECIMAL(10, 8) NULL,
    user_location_lng DECIMAL(11, 8) NULL,
    gym_location_lat DECIMAL(10, 8) NULL,
    gym_location_lng DECIMAL(11, 8) NULL,
    distance_from_gym DECIMAL(8, 2) NULL DEFAULT 0.0, -- in meters
    duration_minutes INT NULL DEFAULT 0, -- calculated on checkout
    qr_code_used VARCHAR(255) NULL, -- gym QR code or user QR code
    session_notes TEXT NULL,
    is_valid_session BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NULL,
    updated_by VARCHAR(255) NULL,
    
    INDEX idx_user_checkin (user_email, check_in_time),
    INDEX idx_gym_date (gym_id, DATE(check_in_time)),
    INDEX idx_active_sessions (user_email, check_out_time),
    INDEX idx_gym_active_sessions (gym_id, check_out_time),
    
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);
```

### 2. Gym Check-in Methods Model
```sql
CREATE TABLE gym_checkin_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    method_type ENUM('gym_qr_scan', 'gym_code', 'quick_checkin', 'owner_scan_user', 'fingerprint', 'face_scan') NOT NULL DEFAULT 'quick_checkin',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    requires_location_check BOOLEAN NOT NULL DEFAULT TRUE,
    max_distance_meters INT NOT NULL DEFAULT 50, -- max distance allowed for location check
    priority_order INT NOT NULL DEFAULT 1, -- display order in UI
    method_name VARCHAR(100) NOT NULL DEFAULT 'Quick Check-in',
    method_description TEXT NULL DEFAULT 'Simple location-based check-in',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NULL,
    updated_by VARCHAR(255) NULL,
    
    UNIQUE KEY unique_gym_method (gym_id, method_type),
    INDEX idx_gym_enabled_methods (gym_id, is_enabled),
    INDEX idx_method_priority (gym_id, priority_order),
    
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);
```

### 3. Gym QR Codes Model
```sql
CREATE TABLE gym_qr_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    qr_code VARCHAR(255) NOT NULL UNIQUE,
    qr_type ENUM('permanent', 'temporary', 'daily') NOT NULL DEFAULT 'permanent',
    expires_at TIMESTAMP NULL, -- for temporary/daily codes
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    usage_count INT NOT NULL DEFAULT 0,
    max_usage_count INT NULL DEFAULT NULL, -- null means unlimited
    qr_name VARCHAR(100) NOT NULL DEFAULT 'Gym QR Code',
    qr_description TEXT NULL DEFAULT 'Scan this QR code to check into the gym',
    location_name VARCHAR(100) NULL DEFAULT 'Main Entrance', -- where QR is placed
    created_by INT NULL, -- gym owner/admin who created it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    INDEX idx_gym_active_qr (gym_id, is_active),
    INDEX idx_qr_lookup (qr_code, is_active),
    INDEX idx_qr_expiry (expires_at, is_active),
    
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 4. Gym Unique Codes Model
```sql
CREATE TABLE gym_unique_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    unique_code VARCHAR(10) NOT NULL UNIQUE, -- 6-10 digit code
    code_type ENUM('permanent', 'daily', 'weekly', 'monthly') NOT NULL DEFAULT 'permanent',
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    usage_count INT NOT NULL DEFAULT 0,
    max_usage_count INT NULL DEFAULT NULL,
    code_name VARCHAR(100) NOT NULL DEFAULT 'Gym Access Code',
    code_description TEXT NULL DEFAULT 'Enter this code to check into the gym',
    auto_regenerate BOOLEAN NOT NULL DEFAULT FALSE, -- auto-generate new code on expiry
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    INDEX idx_gym_active_codes (gym_id, is_active),
    INDEX idx_code_lookup (unique_code, is_active),
    INDEX idx_code_expiry (expires_at, is_active),
    
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 5. User Biometric Data Model (Future)
```sql
CREATE TABLE user_biometric_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    biometric_type ENUM('fingerprint', 'face') NOT NULL DEFAULT 'fingerprint',
    biometric_hash TEXT NOT NULL, -- encrypted/hashed biometric template
    biometric_template_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    gym_id INT NULL, -- if gym-specific registration
    device_info JSON NULL DEFAULT NULL, -- device used for registration
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMP NULL,
    usage_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NULL,
    updated_by VARCHAR(255) NULL,
    
    INDEX idx_user_biometric (user_email, biometric_type, is_active),
    INDEX idx_gym_biometric (gym_id, biometric_type, is_active),
    INDEX idx_biometric_usage (biometric_type, last_used_at),
    
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
);
```

### 6. Attendance Reports Cache Model (For Performance)
```sql
CREATE TABLE attendance_reports_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    report_type ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'daily',
    report_date DATE NOT NULL,
    total_checkins INT NOT NULL DEFAULT 0,
    unique_visitors INT NOT NULL DEFAULT 0,
    avg_session_duration INT NOT NULL DEFAULT 0, -- in minutes
    peak_hour INT NOT NULL DEFAULT 12, -- 0-23 hour format
    peak_occupancy INT NOT NULL DEFAULT 0,
    method_breakdown JSON NULL DEFAULT NULL, -- checkin methods statistics
    hourly_breakdown JSON NULL DEFAULT NULL, -- hour-wise checkin data
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_gym_report_date (gym_id, report_type, report_date),
    INDEX idx_gym_report_type (gym_id, report_type),
    INDEX idx_report_date (report_date, is_current),
    
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);
```

## Updates to Existing Models

### Update Gym Model
```sql
ALTER TABLE gyms ADD COLUMN (
    check_in_radius_meters INT NOT NULL DEFAULT 50,
    default_session_duration_minutes INT NOT NULL DEFAULT 120,
    auto_checkout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_checkout_after_hours INT NOT NULL DEFAULT 24, -- auto-checkout after X hours
    location_verification_required BOOLEAN NOT NULL DEFAULT TRUE,
    current_occupancy INT NOT NULL DEFAULT 0,
    max_occupancy INT NULL DEFAULT NULL,
    allow_multiple_checkins BOOLEAN NOT NULL DEFAULT FALSE, -- allow user to be checked into multiple gyms
    check_in_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    check_out_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    attendance_tracking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    biometric_checkin_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    owner_scan_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    qr_code_checkin_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    unique_code_checkin_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    quick_checkin_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
```

### Update User Model  
```sql
ALTER TABLE users ADD COLUMN (
    default_gym_id INT NULL DEFAULT NULL,
    location_sharing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_checkin_enabled BOOLEAN NOT NULL DEFAULT FALSE, -- auto-checkin when near gym
    checkin_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    checkout_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    location_accuracy_preference ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
    preferred_checkin_method ENUM('gym_qr_scan', 'gym_code', 'quick_checkin', 'owner_scan_user', 'fingerprint', 'face_scan') NULL DEFAULT 'quick_checkin',
    
    FOREIGN KEY (default_gym_id) REFERENCES gyms(id) ON DELETE SET NULL
);
```

## Default Data Insertion Scripts

### Default Gym Check-in Methods
```sql
-- Insert default check-in methods for all existing gyms
INSERT INTO gym_checkin_methods (gym_id, method_type, is_enabled, requires_location_check, max_distance_meters, priority_order, method_name, method_description)
SELECT 
    id as gym_id,
    'quick_checkin' as method_type,
    TRUE as is_enabled,
    TRUE as requires_location_check,
    50 as max_distance_meters,
    1 as priority_order,
    'Quick Check-in' as method_name,
    'Simple location-based check-in' as method_description
FROM gyms WHERE active_status = TRUE;

INSERT INTO gym_checkin_methods (gym_id, method_type, is_enabled, requires_location_check, max_distance_meters, priority_order, method_name, method_description)
SELECT 
    id as gym_id,
    'gym_qr_scan' as method_type,
    TRUE as is_enabled,
    TRUE as requires_location_check,
    100 as max_distance_meters,
    2 as priority_order,
    'Scan Gym QR Code' as method_name,
    'Scan the gym QR code to check in' as method_description
FROM gyms WHERE active_status = TRUE;

INSERT INTO gym_checkin_methods (gym_id, method_type, is_enabled, requires_location_check, max_distance_meters, priority_order, method_name, method_description)
SELECT 
    id as gym_id,
    'gym_code' as method_type,
    TRUE as is_enabled,
    TRUE as requires_location_check,
    50 as max_distance_meters,
    3 as priority_order,
    'Enter Gym Code' as method_name,
    'Enter the gym unique code to check in' as method_description
FROM gyms WHERE active_status = TRUE;

INSERT INTO gym_checkin_methods (gym_id, method_type, is_enabled, requires_location_check, max_distance_meters, priority_order, method_name, method_description)
SELECT 
    id as gym_id,
    'owner_scan_user' as method_type,
    TRUE as is_enabled,
    FALSE as requires_location_check,
    0 as max_distance_meters,
    4 as priority_order,
    'Owner Scan' as method_name,
    'Gym staff scans your QR code' as method_description
FROM gyms WHERE active_status = TRUE;
```

### Default QR Codes for Gyms
```sql
-- Generate default QR codes for all gyms
INSERT INTO gym_qr_codes (gym_id, qr_code, qr_type, qr_name, qr_description, location_name)
SELECT 
    id as gym_id,
    CONCAT('GYM_', id, '_', UNIX_TIMESTAMP()) as qr_code,
    'permanent' as qr_type,
    CONCAT(name, ' - Main QR Code') as qr_name,
    'Main gym entrance QR code' as qr_description,
    'Main Entrance' as location_name
FROM gyms WHERE active_status = TRUE;
```

### Default Unique Codes for Gyms
```sql
-- Generate default 6-digit codes for all gyms
INSERT INTO gym_unique_codes (gym_id, unique_code, code_type, code_name, code_description)
SELECT 
    id as gym_id,
    LPAD(FLOOR(RAND() * 900000) + 100000, 6, '0') as unique_code,
    'permanent' as code_type,
    CONCAT(name, ' - Access Code') as code_name,
    'Main gym access code' as code_description
FROM gyms WHERE active_status = TRUE;
```

## Indexes for Performance
```sql
-- Attendance reporting indexes
CREATE INDEX idx_attendance_gym_daterange ON attendances(gym_id, check_in_time);
CREATE INDEX idx_attendance_user_daterange ON attendances(user_email, check_in_time);
CREATE INDEX idx_attendance_method_stats ON attendances(gym_id, check_in_method, DATE(check_in_time));

-- Active session lookups
CREATE INDEX idx_active_checkins ON attendances(user_email, gym_id) WHERE check_out_time IS NULL;

-- Location-based queries
CREATE INDEX idx_attendance_location ON attendances(user_location_lat, user_location_lng);

-- Performance indexes for reports
CREATE INDEX idx_attendance_duration ON attendances(gym_id, duration_minutes) WHERE duration_minutes IS NOT NULL;
CREATE INDEX idx_attendance_valid_sessions ON attendances(gym_id, is_valid_session, check_in_time);
```

## Triggers for Data Consistency

### Update gym occupancy on check-in/out
```sql
DELIMITER //

CREATE TRIGGER attendance_checkin_trigger 
AFTER INSERT ON attendances
FOR EACH ROW
BEGIN
    UPDATE gyms 
    SET current_occupancy = current_occupancy + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.gym_id;
END//

CREATE TRIGGER attendance_checkout_trigger 
AFTER UPDATE ON attendances
FOR EACH ROW
BEGIN
    IF OLD.check_out_time IS NULL AND NEW.check_out_time IS NOT NULL THEN
        UPDATE gyms 
        SET current_occupancy = GREATEST(current_occupancy - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.gym_id;
        
        -- Calculate and update duration
        UPDATE attendances 
        SET duration_minutes = TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)
        WHERE id = NEW.id;
    END IF;
END//

DELIMITER ;
```
