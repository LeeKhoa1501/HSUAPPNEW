// src/controllers/timetableController.js
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable'); // Model cho collection 'Timetable'
const Course = require('../models/Course');   // Model cho collection 'courses'

/**
 * @desc    Lấy thời khóa biểu của user đang đăng nhập, kèm thông tin môn học
 * @route   GET /api/timetable/my
 * @access  Private (Yêu cầu đăng nhập và middleware 'protect')
 */
const getMyTimetable = async (req, res) => {
    // Log khi bắt đầu xử lý request
    console.log('[TimetableCtrl] === Handling GET /api/timetable/my ===');
    // Lấy userId từ request object, được gắn vào bởi middleware 'protect'
    const userId = req.user?._id;

    // Kiểm tra xem userId có tồn tại không (bảo vệ thêm, dù 'protect' đã kiểm tra)
    if (!userId) {
        console.error('[TimetableCtrl] Error: Missing userId from authenticated request. Middleware issue?');
        // Trả về lỗi 401 Unauthorized nếu không có userId
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng. Vui lòng đăng nhập lại.' });
    }

    // Bắt đầu khối try...catch để xử lý lỗi trong quá trình query DB
    try {
        const userIdObject = new mongoose.Types.ObjectId(userId);
        console.log('[TimetableCtrl]Querying with userId Object:',userIdObject);
        
        // --- Aggregation Pipeline ---
        // Mảng chứa các bước xử lý dữ liệu
        const pipeline = [
            {
              // Bước 1: $match - Lọc ra các bản ghi trong collection 'Timetable'
              // chỉ thuộc về user đang đăng nhập.
              $match: {
                  // Chuyển đổi userId (thường là string) sang kiểu ObjectId của MongoDB
                  userId: new mongoose.Types.ObjectId(userId)
              }
            },
            {
              // Bước 2: $lookup - Thực hiện "join" với collection 'courses'
              $lookup: {
                from: 'courses',
                 localField: 'courseId',
                  foreignField: '_id',
                   as: 'courseDetails'
                }
            },
            {
              // Bước 3: $unwind - "Phẳng hóa" mảng courseDetails.
              // Vì mỗi courseId chỉ tương ứng với một course, mảng courseDetails thường chỉ có 1 phần tử.
              // $unwind sẽ biến mảng 1 phần tử thành một object duy nhất.
              $unwind: {
                path: '$courseDetails',
                // Quan trọng: Giữ lại bản ghi timetable ngay cả khi không tìm thấy course tương ứng
                // (để xử lý trường hợp dữ liệu bị lỗi hoặc course bị xóa)
                preserveNullAndEmptyArrays: true
              }
            },
             {
              // Bước 4: $addFields (Tùy chọn) - Thêm trường để sắp xếp theo thứ tự ngày hợp lý
              $addFields: {
                dayOrder: { // Tên trường mới để lưu thứ tự ngày
                  $switch: {
                    branches: [ // Các trường hợp ánh xạ từ chữ sang số
                      { case: { $eq: ["$dayOfWeek", "Thứ 2"] }, then: 2 },
                      { case: { $eq: ["$dayOfWeek", "Thứ 3"] }, then: 3 },
                      { case: { $eq: ["$dayOfWeek", "Thứ 4"] }, then: 4 },
                      { case: { $eq: ["$dayOfWeek", "Thứ 5"] }, then: 5 },
                      { case: { $eq: ["$dayOfWeek", "Thứ 6"] }, then: 6 },
                      { case: { $eq: ["$dayOfWeek", "Thứ 7"] }, then: 7 },
                      { case: { $eq: ["$dayOfWeek", "Chủ Nhật"] }, then: 8 }, // CN cuối tuần
                    ],
                    default: 9 // Các giá trị khác hoặc null sẽ bị xếp cuối
                  }
                }
              }
            },
            {
              // Bước 5: $sort - Sắp xếp kết quả thời khóa biểu
              $sort: {
                dayOrder: 1,    // Sắp xếp theo thứ tự ngày tăng dần (Thứ 2 -> CN)
                startTime: 1    // Nếu cùng ngày, sắp xếp theo giờ bắt đầu tăng dần
              }
            },
            {
              // Bước 6: $project - Định dạng lại cấu trúc document cuối cùng trả về
              $project: {
                // Giữ lại các trường cần thiết từ collection 'Timetable' gốc
                _id: 1,             // ID của bản ghi lịch học này
                date:1,
                dayOfWeek: 1,
                startTime: 1,
                endTime: 1,
                room: 1,
                instructor: 1,
                semester: 1,
                academicYear: 1,
                // classId: 1, // Giữ lại nếu anh có dùng trường này

                // Lấy các trường mong muốn từ 'courseDetails' (đã được $unwind)
                // Đảm bảo các tên trường này khớp với Schema/Model 'Course.js'
                courseCode: '$courseDetails.courseCode',
                courseName: '$courseDetails.courseName',
                credits: '$courseDetails.credits'
                // notes: '$courseDetails.notes', // Lấy thêm ghi chú môn học nếu cần
              }
            }
          ];
        // --- Kết thúc Pipeline ---

        // Log để biết pipeline sắp được thực thi
        console.log(`[TimetableCtrl] Executing aggregation pipeline for user: ${userId}`);
        // Thực thi pipeline aggregation trên Model Timetable
        const userTimetable = await Timetable.aggregate(pipeline);
        // Log số lượng kết quả tìm được
        console.log(`[TimetableCtrl] Aggregation successful, found ${userTimetable.length} timetable entries.`);

        // Trả về response thành công (status 200)
        return res.status(200).json({
            success: true,                      // Cờ báo thành công
            count: userTimetable.length,       // Số lượng lịch học tìm được
            data: userTimetable                // Mảng dữ liệu thời khóa biểu đã xử lý
        });

    } catch (error) { // Bắt lỗi nếu có bất kỳ lỗi nào xảy ra trong khối try
        console.error('--- ERROR in getMyTimetable Controller ---');
        // Log chi tiết lỗi ra console của server backend để debug
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        // Stack trace rất quan trọng để biết lỗi xảy ra ở dòng nào
        console.error('Error Stack:', error.stack);
        // Log thêm mã lỗi hoặc giá trị gây lỗi nếu có (thường gặp với lỗi MongoDB)
        if (error.code) console.error('Error Code:', error.code);
        if (error.keyValue) console.error('Error keyValue:', error.keyValue);
        console.error('--- END ERROR ---');

        // Kiểm tra lỗi cụ thể (ví dụ CastError nếu ObjectId không hợp lệ)
        if (error instanceof mongoose.Error.CastError) {
             return res.status(400).json({ success: false, message: `Dữ liệu không hợp lệ: ${error.message}` });
        }

        // Trả về lỗi server chung (status 500) cho client
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thời khóa biểu.' });
    }
};

// Export hàm controller để sử dụng trong file route
module.exports = {
    getMyTimetable,
};