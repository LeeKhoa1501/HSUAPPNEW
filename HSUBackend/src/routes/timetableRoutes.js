// src/routes/timetableRoutes.js
const express = require('express');
const { getMyTimetable } = require('../controllers/timetableController'); // Import controller
const { protect } = require('../middleware/authMiddleware'); // Import middleware xác thực

const router = express.Router();

// Định nghĩa route GET /api/timetable/my
// Middleware 'protect' sẽ chạy trước để lấy req.user
router.route('/my').get(protect, getMyTimetable);

// Có thể thêm các route khác liên quan đến timetable sau này

module.exports = router;