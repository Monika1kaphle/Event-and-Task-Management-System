const express = require('express')
const router = express.Router()
const { loginRequired, attachUser } = require('../middleware/auth')
const { authorizeRoles } = require('../middleware/roles')
const db = require('../config/db')
const { sendTaskAssignmentEmail } = require('../services/emailService')

router.use(loginRequired, attachUser)

// Helper to create notification
async function notify(user_id, title, message, type, task_id = null) {
  await db.query(
    'INSERT INTO notifications (user_id, title, message, type, task_id) VALUES (?, ?, ?, ?, ?)',
    [user_id, title, message, type, task_id]
  )
}

// GET all tasks (admin sees all, dept head sees dept tasks, member sees own tasks)
router.get('/', async (req, res) => {
  try {
    let rows
    if (req.user.role === 'ADMIN') {
      [rows] = await db.query(`
        SELECT t.*, 
          u.name as assigned_to_name, 
          d.name as department_name,
          c.name as created_by_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN users c ON t.created_by = c.id
        ORDER BY t.created_at DESC
      `)
    } else if (req.user.role === 'DEPT_HEAD') {
      [rows] = await db.query(`
        SELECT t.*, 
          u.name as assigned_to_name, 
          d.name as department_name,
          c.name as created_by_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN users c ON t.created_by = c.id
        WHERE t.department_id = (SELECT department_id FROM users WHERE id = ?)
        ORDER BY t.created_at DESC
      `, [req.user.id])
    } else {
      [rows] = await db.query(`
        SELECT t.*, 
          u.name as assigned_to_name, 
          d.name as department_name,
          c.name as created_by_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN users c ON t.created_by = c.id
        WHERE t.assigned_to = ?
        ORDER BY t.created_at DESC
      `, [req.user.id])
    }
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create task (admin or dept head)
router.post('/', authorizeRoles('ADMIN', 'DEPT_HEAD'), async (req, res) => {
  const { title, description, department_id, assigned_to, deadline, priority = 'MEDIUM' } = req.body
  if (!title || !assigned_to) return res.status(400).json({ error: 'Title and assigned_to required' })

  try {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, department_id, assigned_to, deadline, priority, status, progress, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 0, ?)`,
      [title, description || null, department_id || null, assigned_to, deadline || null, priority, req.user.id]
    )
    const taskId = result.insertId

    // Get assigned user details for email
    const [[assignedUser]] = await db.query('SELECT name, email FROM users WHERE id = ?', [assigned_to])
    
    // Get department name
    const [[dept]] = await db.query('SELECT name FROM departments WHERE id = ?', [department_id])

    // Notify the assigned user in-app
    const deadlineStr = deadline ? new Date(deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No deadline'
    const notificationMessage = `You have been assigned a new task: "${title}" (Priority: ${priority}) | Deadline: ${deadlineStr} | Assigned by ${req.user.name || 'Admin'}`
    await notify(
      assigned_to,
      'New Task Assigned',
      notificationMessage,
      'TASK_ASSIGNED',
      taskId
    )

    // Send email notification to assigned user
    if (assignedUser && assignedUser.email) {
      try {
        await sendTaskAssignmentEmail(
          assignedUser.email,
          assignedUser.name,
          title,
          description || '',
          dept ? dept.name : 'General',
          deadline || null,
          req.user.name || 'System Admin'
        )
      } catch (emailErr) {
        console.error('Email sending error:', emailErr.message)
      }
    }

    res.status(201).json({ id: taskId, title })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update task progress/status
router.put('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id)
  const { status, progress, description } = req.body

  try {
    const [[task]] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId])
    if (!task) return res.status(404).json({ error: 'Task not found' })

    // --- PERMISSION CHECKS ---
    // Member check: can only update their own tasks
    if (req.user.role === 'MEMBER' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Members can only update their own tasks' })
    }

    // Dept Head check: can only update tasks assigned TO themselves
    if (req.user.role === 'DEPT_HEAD' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Only the assigned member can update this task.' })
    }
    // -------------------------

    const updates = []
    const values = []
    if (status !== undefined) { updates.push('status = ?'); values.push(status) }
    if (progress !== undefined) { updates.push('progress = ?'); values.push(progress) }
    if (description !== undefined) { updates.push('description = ?'); values.push(description) }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' })
    values.push(taskId)

    await db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values)

    // Notify logic when progress is made by anyone other than an Admin
    if (req.user.role !== 'ADMIN') {
      const notifTitle = status === 'COMPLETED' ? 'Task Completed' : 'Task Progress Updated'
      const notifMsg = `"${task.title}" has been updated to ${status || 'in progress'} (${progress ?? task.progress}%) by ${req.user.name}`
      const notifType = status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_UPDATED'

      // Notify admin
      const [[admin]] = await db.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1")
      if (admin) await notify(admin.id, notifTitle, notifMsg, notifType, taskId)

      // Notify dept head if updater is member
      if (req.user.role === 'MEMBER') {
        const [[deptHead]] = await db.query(
          "SELECT id FROM users WHERE role = 'DEPT_HEAD' AND department_id = ? LIMIT 1",
          [task.department_id]
        )
        if (deptHead) await notify(deptHead.id, notifTitle, notifMsg, notifType, taskId)
      }
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE task (admin can delete any, dept head can delete their department tasks)
router.delete('/:id', authorizeRoles('ADMIN', 'DEPT_HEAD'), async (req, res) => {
  try {
    const taskId = parseInt(req.params.id)
    const [[task]] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId])
    
    if (!task) return res.status(404).json({ error: 'Task not found' })

    if (req.user.role === 'ADMIN') {
      await db.query('DELETE FROM tasks WHERE id = ?', [taskId])
      return res.json({ message: 'Task deleted' })
    }

    if (req.user.role === 'DEPT_HEAD') {
      // Dept head can only delete if they created it AND it belongs to their department
      if (task.created_by !== req.user.id || task.department_id !== req.user.department_id) {
        return res.status(403).json({ error: 'Forbidden: You can only delete tasks you created in your department' })
      }

      await db.query('DELETE FROM tasks WHERE id = ?', [taskId])
      return res.json({ message: 'Task deleted' })
    }

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET members of a department (for assignment dropdown)
router.get('/members/:dept_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role FROM users WHERE department_id = ? AND status = 'active'",
      [req.params.dept_id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router