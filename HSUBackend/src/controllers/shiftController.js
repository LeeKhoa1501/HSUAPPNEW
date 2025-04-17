// src/controllers/shiftController.js
const Shift = require('../models/Shift'); // Import Shift Model

// @desc    Lấy tất cả ca học
// @route   GET /api/shifts
// @access  Public
const getShifts = async (req, res) => {
    try {
        // Lấy các trường cần thiết cho Picker: name (label), code (value?) hoặc _id (value)
        // Sắp xếp theo startTime để thứ tự hợp lý
        const shifts = await Shift.find().select('name code startTime').sort('startTime'); // Lấy thêm code và startTime

        // Format lại nếu cần để phù hợp với Picker Frontend
        // Ví dụ Frontend cần { label: name, value: _id }
        const formattedShifts = shifts.map(shift => ({
             _id: shift._id, // Giữ lại _id để làm value
             label: shift.name, // Dùng name làm label
             // code: shift.code // Có thể thêm code nếu Frontend cần
        }));


        res.status(200).json({
            success: true,
            count: formattedShifts.length,
            data: formattedShifts // Trả về dữ liệu đã format
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách ca học:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi Server khi lấy danh sách ca học'
        });
    }
};

module.exports = {
    getShifts,
    // Thêm các hàm khác sau này nếu cần
};