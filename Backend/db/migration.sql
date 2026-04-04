-- 1. Update User Status ENUM first (to prevent data truncation)
ALTER TABLE users MODIFY COLUMN status ENUM('active','inactive','Pending OTP') NOT NULL DEFAULT 'active';

-- 2. Add missing columns to Users
ALTER TABLE users ADD COLUMN department_id INT, ADD COLUMN role_title VARCHAR(255);
ALTER TABLE users ADD CONSTRAINT fk_user_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- 3. Add missing columns to Departments
ALTER TABLE departments ADD COLUMN event_id INT;
ALTER TABLE departments ADD CONSTRAINT fk_dept_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 4. Add missing columns to Events
ALTER TABLE events ADD COLUMN poster_url VARCHAR(255);
ALTER TABLE events ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE events ADD COLUMN location VARCHAR(255);
ALTER TABLE events ADD COLUMN max_capacity INT;

-- 5. Update Tasks table - rename deadline to due_date and add work_done
ALTER TABLE tasks CHANGE COLUMN deadline due_date DATE;
ALTER TABLE tasks ADD COLUMN work_done TEXT;

-- 6. Add missing columns to Tasks
ALTER TABLE tasks ADD COLUMN created_by INT;
ALTER TABLE tasks ADD CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 7. Create Notifications Table (This DOES support IF NOT EXISTS)
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

-- 8. Add Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);