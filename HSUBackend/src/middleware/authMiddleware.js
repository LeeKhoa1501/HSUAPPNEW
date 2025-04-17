// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    console.log('[AuthMiddleware] protect() called.'); // Log khi middleware được gọi
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        console.log('[AuthMiddleware] Authorization header found.');
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('[AuthMiddleware] Token extracted:', token ? 'Yes' : 'No'); // Che token thật đi

            const secret = process.env.JWT_SECRET; // Đọc secret
             console.log('[AuthMiddleware] JWT_SECRET available:', secret ? 'Yes' : '!!! No !!!'); // Kiểm tra secret
             if (!secret) { throw new Error('JWT Secret not configured in middleware'); } // Ném lỗi nếu thiếu

            const decoded = jwt.verify(token, secret); // Dùng biến secret
            console.log('[AuthMiddleware] Token decoded:', decoded); // Log payload đã giải mã

            // Dùng try-catch riêng cho DB query để bắt lỗi rõ hơn
            try {
                 req.user = await User.findById(decoded.id).select('-password');
                 console.log('[AuthMiddleware] User found in DB:', req.user ? req.user._id : 'Not Found!');
            } catch (dbError) {
                 console.error('[AuthMiddleware] DB Error finding user:', dbError);
                 return res.status(500).json({ success: false, message: 'Lỗi server khi tìm thông tin người dùng.' });
            }


            if (!req.user) {
                console.log('[AuthMiddleware] User ID from token not found in DB.');
                return res.status(401).json({ success: false, message: 'Người dùng không tồn tại.' });
            }

            console.log('[AuthMiddleware] Authentication successful, calling next().');
            next(); // Cho phép đi tiếp
        } catch (error) {
            console.error('[AuthMiddleware] Token verification/processing error:', error.name, error.message); // Log rõ tên lỗi
            if (error.name === 'JsonWebTokenError') { return res.status(401).json({ success: false, message: 'Token không hợp lệ.' }); }
            if (error.name === 'TokenExpiredError') { return res.status(401).json({ success: false, message: 'Token đã hết hạn.' }); }
             if (error.message === 'JWT Secret not configured in middleware') { return res.status(500).json({ success: false, message: 'Lỗi cấu hình server (JWT Secret).' }); }
            res.status(401).json({ success: false, message: 'Xác thực thất bại.' });
        }
    } else {
         console.log('[AuthMiddleware] No Bearer token found in Authorization header.');
         // Chỉ trả lỗi nếu token thực sự không được tìm thấy sau khi kiểm tra header
         if (!token) {
            res.status(401).json({ success: false, message: 'Chưa xác thực, không tìm thấy token.' });
         }
    }

};

module.exports = { protect };