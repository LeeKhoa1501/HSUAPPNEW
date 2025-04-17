// src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// KHÔNG cần require dotenv ở đây nữa

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET; // Đọc từ process.env (đã load bởi server.js)
    if (!secret) { throw new Error('JWT Secret not configured'); }
    return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for email: ${email}`); // Log email nhận được

    if (!email || !password) { return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' }); }

    try {
        // Tìm user, đảm bảo lấy cả password về để so sánh
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        // console.log('[AUTH] User found:', user ? user.email : 'Not Found'); // Log xem có tìm thấy user không

        if (user && (await user.matchPassword(password))) { // Gọi matchPassword
            console.log('[AUTH] Password matched!'); // Log khi khớp pass
            const token = generateToken(user._id);
            if (!token) { return res.status(500).json({ success: false, message: 'Lỗi server khi tạo token.' }); }

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName, 
                    studentId: user.studentId,
                    role: user.role,
                },
                token: token,
            });
        } else {
            console.log('[AUTH] Password mismatch or user not found.'); // Log khi sai
            res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        }
    } catch (error) {
        console.error('[AUTH] Login Error:', error);
        if (error.message === 'JWT Secret not configured') { res.status(500).json({ success: false, message: 'Lỗi cấu hình server (JWT).' });}
        else { res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập' }); }
    }
};

module.exports = { loginUser };