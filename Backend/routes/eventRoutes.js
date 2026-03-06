const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 
const multer = require('multer');
const path = require('path');

// Re-use your existing Multer setup or move it to a helper file
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/posters'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Define Event-specific endpoints
router.get('/', adminController.getEvents);
router.post('/post', upload.single('poster'), adminController.postEvent);

module.exports = router;