const pool = require('../config/db');

// --- 1. Modified: Fetch only Department Heads for the dropdown ---
exports.getUsers = async (req, res) => {
    try {
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

// 5. Post Event (UPDATED TO HANDLE POSTER UPLOAD AND PAST DATE VALIDATION)
exports.postEvent = async (req, res) => {
    const { title, event_date, event_time, description } = req.body;
    
    if (!title || !event_date) return res.status(400).json({ error: "Title and Date are required" });

    // Validate against past date/time
    const selectedDateTime = new Date(`${event_date}T${event_time || '00:00'}`);
    const now = new Date();
    if (selectedDateTime < now) {
        return res.status(400).json({ error: "Cannot post an event in the past!" });
    }

    // req.file is created by the multer middleware in your routes
    const poster_url = req.file ? `/uploads/posters/${req.file.filename}` : null;

    try {
        // Updated query to include the poster_url column
        await pool.query(
            'INSERT INTO events (title, event_date, event_time, description, poster_url) VALUES (?, ?, ?, ?, ?)',
            [title, event_date, event_time, description || '', poster_url]
        );
        res.status(201).json({ message: 'Event posted successfully' });
    } catch (err) {
        console.error("Post Event Error:", err);
        res.status(500).json({ error: "Database error: " + err.message });
    }
};

// Add this to your controllers/adminController.js
exports.getEvents = async (req, res) => {
    try {
        const [events] = await pool.query("SELECT * FROM events ORDER BY event_date DESC");
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch events" });
    }
};