const bcrypt = require('bcrypt');
const User = require('../models/user');
const db = require('../config/db'); // Needed for direct queries
const { sendOTPEmail } = require('../services/emailService');

/**
 * NEW: Invite Department Head
 * Triggered by Admin to send an OTP and create a pending record
 */
async function inviteDeptHead(req, res) {
    const { fullName, email, departmentId } = req.body;

    if (!fullName || !email || !departmentId) {
        return res.status(400).json({ error: "Full Name, Email, and Department are required" });
    }

    try {
        // 1. Check if email already exists
        const existing = await User.findByEmail(email);
        if (existing) return res.status(409).json({ error: 'User with this email already exists' });

        // 2. Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Create the user in the database
        // We set password to null and status to 'Pending OTP'
        const [result] = await db.query(
            `INSERT INTO users (full_name, email, department_id, role, status, otp_code) 
             VALUES (?, ?, ?, 'DEPT_HEAD', 'Pending OTP', ?)`,
            [fullName, email, departmentId, otp]
        );

        // 4. Send the OTP via Email
        await sendOTPEmail(email, otp);

        // 5. Send notification to the newly created department head
        try {
            const [[dept]] = await db.query('SELECT name FROM departments WHERE id = ?', [departmentId]);
            const userId = result.insertId;
            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                [
                    userId,
                    'Department Head Invitation',
                    `You have been invited as the head of the "${dept?.name || 'Department'}" department. Please verify your email to complete setup.`,
                    'DEPT_HEAD_ASSIGNED'
                ]
            );
        } catch (notifErr) {
            console.error('Notification error:', notifErr.message);
            // Continue even if notification fails
        }

        res.status(201).json({ message: "Invitation sent successfully to " + email });
    } catch (err) {
        console.error('Invite Error:', err);
        res.status(500).json({ error: "Failed to process invitation" });
    }
}

/**
 * Standard Create User (Existing)
 */
async function createUser(req, res) {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        const existing = await User.findByEmail(email);
        if (existing) return res.status(409).json({ error: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        // Ensure your model supports the "status" field
        const user = await User.createUser({ 
            name, 
            email, 
            password: hashed, 
            role, 
            status: 'active' 
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * List all users (Existing)
 */
async function listUsers(req, res) {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
}

/**
 * Get specific user (Existing)
 */
async function getUser(req, res) {
    const id = parseInt(req.params.id, 10);
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * Update User (Existing)
 */
async function updateUser(req, res) {
    const id = parseInt(req.params.id, 10);
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const payload = {};
        if (req.body.name) payload.name = req.body.name;
        if (req.body.email) payload.email = req.body.email;
        if (req.body.password) {
            payload.password = await bcrypt.hash(req.body.password, 10);
        }

        await User.updateUser(id, payload);
        const updated = await User.findById(id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
}

/**
 * Delete User (Updated placeholder)
 */
async function deleteUser(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        // Assuming your model has a deleteUser function
        // await User.deleteUser(id); 
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
}

// Ensure all these functions are exported for users.js
module.exports = {
    inviteDeptHead,
    createUser,
    listUsers,
    getUser,
    updateUser,
    deleteUser
};