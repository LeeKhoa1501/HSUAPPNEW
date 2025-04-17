// src/models/Timetable.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timetableSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới Model User
        required: true,
        index: true // Nên đánh index cho userId để query nhanh hơn
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course', // Tham chiếu tới Model Course
        required: true
    },
    dayOfWeek: { // Ví dụ: "Thứ 2", "Thứ 3", ...
        type: String,
        required: true
    },
    startTime: { // Ví dụ: "07:00"
        type: String,
        required: true
    },
    endTime: { // Ví dụ: "09:30"
        type: String,
        required: true
    },
    room: { // Ví dụ: "A.405", "Online"
        type: String
    },
    instructor: { // Tên giảng viên
        type: String
    },
    semester: { // Ví dụ: "Học kỳ 1", "Học kỳ Tết"
        type: String
    },
    academicYear: { // Ví dụ: "2023-2024"
        type: String
    },
    classId: { // Mã lớp học phần (tùy chọn)
        type: String
    }
    // Không cần timestamps ở đây nếu dữ liệu TKB ít thay đổi
}, { collection: 'Timetable' }); // Chỉ định rõ tên collection

// Tạo index tổng hợp để tối ưu query tìm kiếm theo user, năm, kỳ
timetableSchema.index({ userId: 1, academicYear: 1, semester: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;