const pool = require('../config/db');

// --- Fetch all departments for dropdowns ---
exports.getDepartments = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name FROM departments');
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch departments" });
    }
};

// 1. Get Dashboard Stats
exports.getDashboardData = async (req, res) => {
    try {
        res.json({ message: "Dashboard data loaded" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Add Department
exports.addDepartment = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Department name is required" });
    try {
        const [result] = await pool.query('INSERT INTO departments (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Department added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};

// 3. Assign Task
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

// 4. Post Event
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