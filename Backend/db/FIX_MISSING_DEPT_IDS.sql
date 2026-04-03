-- Fix Script: Assign department_id to existing Department Heads and Members

-- Step 1: View all users without department_id by role
SELECT 'DEPT_HEAD without dept' as issue_type, id, name, email FROM users WHERE role = 'DEPT_HEAD' AND department_id IS NULL
UNION ALL
SELECT 'MEMBER without dept', id, name, email FROM users WHERE role = 'MEMBER' AND department_id IS NULL;

-- Step 2: Fix DEPT_HEAD users - Associate them with their department
-- Find which department each head should belong to
SELECT u.id, u.name, u.email, d.id as dept_id, d.name as dept_name, d.head_id
FROM users u
LEFT JOIN departments d ON d.head_id = u.id
WHERE u.role = 'DEPT_HEAD' AND d.id IS NOT NULL;

-- Then update each one (Run these manually after checking the results above):
-- EXAMPLE: UPDATE users SET department_id = 79 WHERE id = 30 AND role = 'DEPT_HEAD';

-- Step 3: For MEMBER users, check which department they should belong to
-- (Usually depends on who invited them or admin assignment)
SELECT u.id, u.name, u.email, u.role, u.status FROM users u WHERE role = 'MEMBER' AND department_id IS NULL;

-- Step 4: After all fixes, verify the results
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN department_id IS NOT NULL THEN 1 END) as users_with_dept,
    COUNT(CASE WHEN department_id IS NULL THEN 1 END) as users_without_dept
FROM users
GROUP BY role;

-- Step 5: Verify status values are correct
SELECT DISTINCT status FROM users;
-- Should show: active, inactive, pending_otp
