// src/routes/authRoutes.js
const express = require('express');
const { loginUser } = require('../controllers/authController'); // Import controller

const router = express.Router();

// Định nghĩa route POST cho /login
router.post('/login', loginUser);

// Thêm route POST /register sau này

module.exports = router;