// src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Location = require('../models/Location');
const Shift = require('../models/Shift');
const mongoose = require('mongoose');

const createBooking = async (req, res) => {
    // --- LOG NGAY KHI VÀO CONTROLLER ---
    console.log('[BK_CTRL] === Handling POST /api/bookings ===');
    console.log('[BK_CTRL] req.user from middleware:', req.user ? req.user._id : 'No user attached!'); // Kiểm tra req.user
    console.log('[BK_CTRL] req.body received:', JSON.stringify(req.body, null, 2));

    const {
        locationId, shiftId, bookingDate, startTime, endTime, attendees,
        purpose, purposeDetail, notes
    } = req.body;
    const userId = req.user?._id;

    // --- Validation cơ bản ---
    if (!userId) {
        console.error('[BK_CTRL] Validation Error: Missing userId from middleware.');
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng (middleware error?).' });
    }
    if (!locationId || !shiftId || !bookingDate || !startTime || !endTime || !attendees || !purpose) {
        console.error('[BK_CTRL] Validation Error: Missing required fields in body.');
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }

    try {
        console.log('[BK_CTRL] Attempting to convert ObjectIDs...');
        let locationObjectId, shiftObjectId;
        try {
            locationObjectId = new mongoose.Types.ObjectId(locationId);
            shiftObjectId = new mongoose.Types.ObjectId(shiftId);
            console.log('[BK_CTRL] Converted ObjectIDs - Location:', locationObjectId, 'Shift:', shiftObjectId);
        } catch (castError) {
            console.error('[BK_CTRL] CastError converting ObjectId:', castError.message);
            // Ném lỗi rõ ràng hơn để catch bên ngoài bắt được
            throw new mongoose.Error.CastError('ObjectId', `Giá trị ID "${castError.value}" không hợp lệ cho trường ${castError.path}.`);
        }


        console.log('[BK_CTRL] Attempting to parse bookingDate:', bookingDate);
        const dateParts = String(bookingDate).split('/'); // Đảm bảo bookingDate là string
        let bookingDateObject = null;
        if (dateParts.length === 3) {
            const day = parseInt(dateParts[0], 10);
            const monthIndex = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(dateParts[2], 10);

            // Kiểm tra xem parse có thành công không và ngày có hợp lệ không
             if (!isNaN(day) && !isNaN(monthIndex) && !isNaN(year) && monthIndex >= 0 && monthIndex <= 11) {
                 // Dùng Date.UTC để tránh vấn đề múi giờ khi tạo Date object
                 bookingDateObject = new Date(Date.UTC(year, monthIndex, day));
                 // Kiểm tra lại lần nữa sau khi tạo Date object
                 if (isNaN(bookingDateObject.getTime())) {
                     console.error('[BK_CTRL] Invalid Date Object after creation (NaN).');
                     bookingDateObject = null;
                 } else {
                     console.log('[BK_CTRL] Parsed Date Object (UTC):', bookingDateObject.toISOString());
                 }
             } else {
                 console.error('[BK_CTRL] Invalid date parts after parsing:', day, monthIndex, year);
             }
        } else {
            console.error('[BK_CTRL] Invalid date format (expecting DD/MM/YYYY).');
        }


        if (!bookingDateObject) {
            console.error('[BK_CTRL] Validation Error: bookingDateObject is null or invalid.');
            return res.status(400).json({ success: false, message: 'Định dạng ngày đặt không hợp lệ (cần DD/MM/YYYY).' });
        }

        // Kiểm tra sự tồn tại (có thể comment lại để test bước save trước)
        console.log('[BK_CTRL] Checking existence of Location and Shift...');
        const locationExists = await Location.findById(locationObjectId);
        const shiftExists = await Shift.findById(shiftObjectId);
        console.log('[BK_CTRL] Location exists:', !!locationExists, 'Shift exists:', !!shiftExists);
        if (!locationExists || !shiftExists) {
             console.error('[BK_CTRL] Not Found Error: Location or Shift does not exist.');
             return res.status(404).json({ success: false, message: 'Địa điểm hoặc ca học không tồn tại.' });
        }

        // Tạo booking mới
        console.log('[BK_CTRL] Creating new Booking instance...');
        const newBooking = new Booking({
            userId: userId,
            locationId: locationObjectId,
            shiftId: shiftObjectId,
            bookingDate: bookingDateObject,
            startTime: String(startTime), // Đảm bảo là string
            endTime: String(endTime),     // Đảm bảo là string
            attendees: Number(attendees), // Chuyển sang Number
            purpose: String(purpose),   // Đảm bảo là string
            purposeDetail: String(purposeDetail || ''),
            notes: String(notes || ''),
            status: 'pending'
        });
        console.log('[BK_CTRL] New booking instance created:', newBooking);

        // Lưu vào database
        console.log('[BK_CTRL] Attempting to save booking...');
        const savedBooking = await newBooking.save();
        console.log('[BK_CTRL] Booking saved successfully! ID:', savedBooking._id);

        // Trả về thành công
        return res.status(201).json({
            success: true,
            message: 'Yêu cầu đặt phòng của bạn đã được gửi thành công!',
            data: savedBooking
        });

    } catch (error) {
        // --- LOG LỖI CHI TIẾT TRONG CATCH ---
        console.error('--- ERROR in createBooking Controller ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        // In thêm các thuộc tính lỗi cụ thể nếu có
        if (error.errors) console.error('Validation Errors:', error.errors);
        if (error.path) console.error('Cast Error Path:', error.path);
        if (error.value) console.error('Cast Error Value:', error.value);
        console.error('Error Stack:', error.stack);
        console.error('--- END ERROR ---');

        // Xử lý lỗi cụ thể
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        // Bắt lỗi CastError rõ ràng hơn
         if (error instanceof mongoose.Error.CastError) {
             // Có thể lấy path và value từ error object nếu cần
             return res.status(400).json({ success: false, message: `Dữ liệu không hợp lệ cho trường ${error.path}: ${error.value}.` });
         }
        // Lỗi server chung
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo yêu cầu đặt phòng.' });
    }
};

const getAllBookings = async (req, res) => {
    console.log('[BK_CTRL] === Handling GET /api/bookings ===');
    try {
        // --- Pipeline Aggregation ---
        const pipeline = [
            {
              // Bước 1: Join với 'locations' (Đảm bảo tên collection đúng)
              $lookup: {
                from: 'Locations', // Tên collection trong DB
                localField: 'locationId',
                foreignField: '_id',
                as: 'locationInfo',
              },
            },
            {
              // Bước 2: Join với 'shifts' 
              $lookup: {
                from: 'shifts', // Tên collection trong DB
                localField: 'shiftId',
                foreignField: '_id',
                as: 'shiftInfo',
              },
            },
            {
              // Bước 3: $unwind để lấy object thay vì mảng
              $unwind: {
                path: '$locationInfo',
                preserveNullAndEmptyArrays: true, // Giữ booking nếu không tìm thấy location
              },
            },
            {
              $unwind: {
                path: '$shiftInfo',
                preserveNullAndEmptyArrays: true, // Giữ booking nếu không tìm thấy shift
              },
            },
            {
              // Bước 4: $project để chọn lọc và định dạng lại output
              $project: {
                // Bỏ các trường không cần thiết
                locationId: 0, // Bỏ ID gốc
                shiftId: 0,    // Bỏ ID gốc
                __v: 0,        // Bỏ version key
                locationInfo: 0, // Bỏ object join đầy đủ
                shiftInfo: 0,    // Bỏ object join đầy đủ

                // Giữ lại các trường cần thiết từ booking gốc
                _id: 1,
                userId: 1, // Có thể cần join với user để lấy tên user
                bookingDate: 1,
                startTime: 1,
                endTime: 1,
                attendees: 1,
                purpose: 1,
                purposeDetail: 1,
                notes: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,

                // Thêm các trường tên (Đảm bảo tên trường 'name' đúng trong Model)
                locationName: '$locationInfo.name',
                shiftName: '$shiftInfo.name',
                // Optional: Thêm thông tin khác nếu cần
                // shiftDescription: '$shiftInfo.description',
              },
            },
             // Bước 5 (Optional): Sắp xếp
             {
               $sort: { createdAt: -1 } // Mới nhất lên trước
             }
          ];

        console.log('[BK_CTRL] Executing aggregation pipeline for all bookings...');
        const bookings = await Booking.aggregate(pipeline);
        console.log(`[BK_CTRL] Aggregation successful, found ${bookings.length} bookings.`);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings // Trả về mảng bookings đã có tên
        });

    } catch (error) {
        console.error('--- ERROR in getAllBookings Controller ---');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('--- END ERROR ---');
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách đặt phòng.' });
    }
};

// === HÀM LẤY BOOKING CỦA USER HIỆN TẠI KÈM TÊN (SỬ DỤNG AGGREGATION) ===
const getMyBookings = async (req, res) => {
    console.log('[BK_CTRL] === Handling GET /api/bookings/mybookings ===');
    const userId = req.user?._id; // Lấy userId từ middleware protect

    if (!userId) {
        console.error('[BK_CTRL] Error: Missing userId from authenticated request.');
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng.' });
    }

    try {
         // --- Pipeline Aggregation (Tương tự getAllBookings nhưng có thêm $match) ---
         const pipeline = [
           {
             // Bước 0: Lọc theo userId NGAY TỪ ĐẦU
             $match: {
                 userId: new mongoose.Types.ObjectId(userId) // Chuyển userId sang ObjectId
             }
           },
           // --- Các bước $lookup, $unwind, $project, $sort y hệt như trong getAllBookings ---
           { $lookup: { from: 'locations', localField: 'locationId', foreignField: '_id', as: 'locationInfo' } },
           { $lookup: { from: 'shifts', localField: 'shiftId', foreignField: '_id', as: 'shiftInfo' } },
           { $unwind: { path: '$locationInfo', preserveNullAndEmptyArrays: true } },
           { $unwind: { path: '$shiftInfo', preserveNullAndEmptyArrays: true } },
           {
             $project: {
               locationId: 0, shiftId: 0, __v: 0, locationInfo: 0, shiftInfo: 0,
               _id: 1, userId: 1, bookingDate: 1, startTime: 1, endTime: 1, attendees: 1, purpose: 1, purposeDetail: 1, notes: 1, status: 1, createdAt: 1, updatedAt: 1,
               locationName: '$locationInfo.name',
               shiftName: '$shiftInfo.name',
             }
           },
           { $sort: { createdAt: -1 } }
         ];
         // --- Kết thúc Pipeline ---

        console.log(`[BK_CTRL] Executing aggregation pipeline for user: ${userId}`);
        const myBookings = await Booking.aggregate(pipeline);
        console.log(`[BK_CTRL] Aggregation successful, found ${myBookings.length} bookings for user.`);

        return res.status(200).json({
            success: true,
            count: myBookings.length,
            data: myBookings // Trả về mảng booking của user với tên location/shift
        });

    } catch (error) {
        console.error('--- ERROR in getMyBookings Controller ---');
        // Thêm kiểm tra lỗi CastError nếu userId gửi lên không hợp lệ (dù protect thường đảm bảo rồi)
        if (error instanceof mongoose.Error.CastError && error.path === '_id') {
             console.error('[BK_CTRL] CastError on userId:', error.value);
             return res.status(400).json({ success: false, message: 'UserId không hợp lệ.' });
        }
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('--- END ERROR ---');
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách đặt phòng của bạn.' });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getMyBookings,
};