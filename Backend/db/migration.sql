-- Migration Script to add missing columns
-- Run this script if you already have the tables created

-- Add event_id to departments table if it doesn't exist
ALTER TABLE departments ADD COLUMN IF NOT EXISTS event_id INT;
ALTER TABLE departments ADD CONSTRAINT FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Add created_by to tasks table if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by INT;
ALTER TABLE tasks ADD CONSTRAINT FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add department_id to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title VARCHAR(255);
ALTER TABLE users ADD CONSTRAINT FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  task_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Add index for notifications query optimization
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
