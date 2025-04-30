-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `face_attendance_db`;
USE `face_attendance_db`;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- store hashed password
    company_name VARCHAR(100),
    designation VARCHAR(100),
    preset INT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
