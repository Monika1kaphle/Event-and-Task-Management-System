require('dotenv').config();
const pool = require('../config/db');

async function addDepartments() {
  try {
    console.log('Connecting to database...');
    const departments = [
      'Design Department',
      'Marketing Department', 
      'Development Department',
      'HR Department'
    ];

    for (const dept of departments) {
      try {
        const [result] = await pool.query('INSERT INTO departments (name, head_id) VALUES (?, NULL)', [dept]);
        console.log(`✅ Added: ${dept}`);
      } catch (insertErr) {
        // If department already exists, skip it
        if (insertErr.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  ${dept} already exists`);
        } else {
          throw insertErr;
        }
      }
    }

    console.log('✅ All departments processed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding departments:', err);
    process.exit(1);
  }
}

addDepartments();
