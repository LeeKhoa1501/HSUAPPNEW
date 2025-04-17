// src/server.js
const dotenv = require('dotenv');
const findConfig = require('find-config');
const path = require('path');
const envPath = findConfig('.env');

if (envPath) {
    dotenv.config({ path: envPath }); // Load nếu tìm thấy
    console.log(`[Server] Loaded .env from: ${envPath}`);
  } else {
    console.error('!!! [Server] Could not find .env file using find-config!');
  }

  
console.log(`[Server] MONGODB_URI Loaded: ${process.env.MONGODB_URI ? 'OK' : '!!! UNDEFINED !!!'}`); // Log kiểm tra
console.log(`[Server] JWT_SECRET Loaded: ${process.env.JWT_SECRET ? 'OK' : '!!! UNDEFINED !!!'}`);
console.log(`[Server] PORT Loaded: ${process.env.PORT}`);

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const locationRoutes = require('./routes/locationRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const bookingRoutes = require ('./routes/bookingRoutes')
const authRoutes = require('./routes/authRoutes'); // <-- Import authRoutes
const userRoutes = require('./routes/userRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const examRoutes = require('./routes/examRoutes');

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/locations', locationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/auth', authRoutes); // <-- Mount authRoutes
app.use('/api/bookings',bookingRoutes);
app.use('/api/users',userRoutes);
app.use('/api/timetable',timetableRoutes);
app.use('/api/exams', examRoutes);


app.get('/', (req, res) => { res.send('HSU Backend API is running...'); });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });