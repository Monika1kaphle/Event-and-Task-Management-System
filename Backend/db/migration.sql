-- 1. Update User Status ENUM first (to prevent data truncation)
ALTER TABLE users MODIFY COLUMN status ENUM('active','inactive','pending_otp') NOT NULL DEFAULT 'active';

-- 2. Add missing columns to Users
ALTER TABLE users ADD COLUMN department_id INT, ADD COLUMN role_title VARCHAR(255);
ALTER TABLE users ADD CONSTRAINT fk_user_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- 3. Add missing columns to Departments
ALTER TABLE departments ADD COLUMN event_id INT;
ALTER TABLE departments ADD CONSTRAINT fk_dept_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 4. Add missing columns to Tasks
ALTER TABLE tasks ADD COLUMN created_by INT;
ALTER TABLE tasks ADD CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 5. Create Notifications Table (This DOES support IF NOT EXISTS)
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

-- 6. Add Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_tasks_department_id ON tasks(department_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);