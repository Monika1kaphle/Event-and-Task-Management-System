const pool = require('../config/db');

// --- 1. Modified: Fetch only Department Heads for the dropdown ---
exports.getUsers = async (req, res) => {
    try {
        // We filter by role to ensure 'admin' doesn't show up in the dropdown
        // Assuming your department heads will have the role 'department_head'
        const [users] = await pool.query(
            "SELECT id, name, email FROM users WHERE role = 'department_head'"
        );
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// --- 2. Modified: Fetch departments WITH their Head Names ---
exports.getDepartments = async (req, res) => {
    try {
        // Using LEFT JOIN to get the head's name from the users table 
        // using the head_id stored in the departments table
        const query = `
            SELECT 
                d.id, 
                d.name, 
                d.created_at, 
                u.name AS head_name 
            FROM departments d
            LEFT JOIN users u ON d.head_id = u.id
        `;
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch departments" });
    }
};

// 3. Get Dashboard Stats
exports.getDashboardData = async (req, res) => {
    try {
        res.json({ message: "Dashboard data loaded" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Add Department (Handles head_id)
exports.addDepartment = async (req, res) => {
    const { name, head_id } = req.body; 

    if (!name) return res.status(400).json({ error: "Department name is required" });

    try {
        const [result] = await pool.query(
            'INSERT INTO departments (name, head_id, created_at) VALUES (?, ?, NOW())', 
            [name, head_id || null]
        );
        
        res.status(201).json({ message: 'Department added successfully', id: result.insertId });
    } catch (err) {
        console.error("Error adding department:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// ... keep assignTask and postEvent as they were

// 4. Assign Task
exports.assignTask = async (req, res) => {
    const { title, description, department_id, assigned_to_id, deadline } = req.body;
    
    if (!title || !department_id || !assigned_to_id || !deadline) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await pool.query(
            'INSERT INTO tasks (title, description, department_id, assigned_to, deadline, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', department_id, assigned_to_id, deadline, 'PENDING', 'MEDIUM']
        );
        res.status(201).json({ message: 'Task assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// 5. Post Event
exports.postEvent = async (req, res) => {
    const { title, event_date, event_time, description } = req.body;
    
    if (!title || !event_date) return res.status(400).json({ error: "Title and Date are required" });

    try {
        await pool.query(
            'INSERT INTO events (title, event_date, event_time, description) VALUES (?, ?, ?, ?)',
            [title, event_date, event_time, description || '']
        );
        res.status(201).json({ message: 'Event posted successfully' });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};