# Fix: Department Head Task Management - Members Not Showing

## Root Causes Found & Fixed

### 1. **Missing `department_id` in JWT Tokens** ✅
   - **Problem**: JWT tokens were issued without `department_id`, causing frontend filtering to fail
   - **Fixed in**: `Backend/routes/auth.js`
   - Auth endpoints now include `department_id` in all JWT tokens

### 2. **Status Enum Mismatch** ✅
   - **Problem**: Code used 'Pending OTP' but schema only accepted 'active'/'inactive'
   - **Fixed in**: `Backend/db/migration.sql`
   - Updated status ENUM to: `'active'`, `'inactive'`, `'pending_otp'`

### 3. **Inconsistent Status Usage** ✅
   - **Problem**: Auth flow used 'Pending OTP' (with capital P and space)
   - **Fixed in**: `Backend/routes/auth.js`
   - All references now use lowercase: `'pending_otp'`

### 4. **Department ID Not Set on User Creation** ✅
   - **Problem**: Department heads/members weren't being created with `department_id`
   - **Fixed in**: `Backend/controllers/userController.js`
   - Now properly assigns `department_id` when inviting users

### 5. **Frontend Defensive Checks Added** ✅
   - **Fixed in**: `Frontend/src/pages/DepartmentHead/DeptHeadTaskPage.tsx`
   - Added error banner if `department_id` is null
   - Early exit with user feedback

---

## Steps to Fix

### Step 1: Update Database Schema
Run the migration script to add the new status enum:
```bash
# Connect to your MySQL database and run:
mysql -u root -p event_management < Backend/db/migration.sql
```

Or manually in your database client:
```sql
ALTER TABLE users MODIFY status ENUM('active','inactive','pending_otp') NOT NULL DEFAULT 'active';
```

### Step 2: Update Existing Department Heads (IF NEEDED)
If you have existing department heads without department_id, update them:
```sql
-- Find department heads without department_id
SELECT id, name, email, department_id FROM users WHERE role = 'DEPT_HEAD' AND department_id IS NULL;

-- Manually assign them to their department
UPDATE users SET department_id = 96 WHERE id = 30;  -- Example: assign user 30 to department 96
```

### Step 3: Restart Backend
```bash
cd Backend
npm run dev
```

### Step 4: Test the Flow
1. **Option A - If inviting a new Dept Head:**
   - Admin creates new Dept Head with department assignment
   - New Dept Head logs in
   - Members should now appear ✅

2. **Option B - Existing Dept Head fix:**
   - Clear browser localStorage (Ctrl+Shift+Delete)
   - Log out and re-login
   - Verify department_id is now in the token

---

## Verification

### Frontend Console
After login, you should see in browser console:
```
=== Current User from localStorage ===
{
  id: 30,
  name: "Millie",
  email: "pokhreimillie@gmail.com",
  role: "DEPT_HEAD",
  department_id: 79  ✅ KEY: This should NOT be null
}
```

### Backend Console
After API calls, you should see:
```
✅ DEPT_HEAD Created: { userId: 30, email: 'email@example.com', departmentId: 79, status: 'pending_otp' }
✅ Login Success: { userId: 30, email: '...', role: 'DEPT_HEAD', department_id: 79 }
```

---

## Files Changed
- ✅ `Backend/routes/auth.js` - Added department_id to tokens
- ✅ `Backend/controllers/userController.js` - Proper department assignment on invite
- ✅ `Backend/db/migration.sql` - Schema update for pending_otp status
- ✅ `Frontend/src/pages/DepartmentHead/DeptHeadTaskPage.tsx` - Defensive coding + error banner

---

## Expected Result After Fix
When Department Head logs in:
- ✅ Department info shows correctly
- ✅ Team members list populates
- ✅ Task assignment dropdown shows team members
- ✅ Can assign tasks to team members
