-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','DEPT_HEAD','MEMBER','CLIENT') NOT NULL DEFAULT 'CLIENT',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  department_id INT,
  role_title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  login_attempts INT DEFAULT 0,
  lock_until DATETIME DEFAULT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 2. Departments Table (For "Add Department" & "Department Progress")
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  head_id INT, -- Stores the ID of the Department Head
  event_id INT, -- Stores the Event ID (event-specific departments)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (head_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 3. Tasks Table (For "Assign Task")
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  start_date DATE, -- Optional based on your form
  deadline DATE,
  status ENUM('PENDING','IN_PROGRESS','COMPLETED','OVERDUE') DEFAULT 'PENDING',
  progress INT DEFAULT 0,
  department_id INT,
  assigned_to INT NOT NULL, -- The user (Department Head/Member) assigned to the task
  created_by INT, -- Admin or Department Head who created the task
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Events Table (For "Post an Event" & "Calendar View")
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Notifications Table (For task notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50), -- TASK_ASSIGNED, TASK_COMPLETED, TASK_UPDATED, etc.
  task_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);