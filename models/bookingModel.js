const client = require('../db');
const moment = require('moment');
const { getTime } = require('./Utils/Utils');

const getBookingDetail = async (id) => {
    try {
        const res = await client.query(
            `SELECT
            b.id AS id,
            b.rate,
            b.note,
            b.hint_id ,
            b.comment,
            u.user_name AS pgt_name,
            b.user_id as user_id,
            u2.user_name AS user_name,
            b.date,
            b.price,
            b.status AS status,
            b.time_from,
            b.time_to
        FROM
            booking b
        JOIN
            "user" u ON b.hint_id = u.id
        JOIN
            "user" u2 ON b.user_id = u2.id
        WHERE
        b.id = $1`,
            [id]
        );
        if (res.rows) {
            return res.rows[0];
        }
        else {
            return null;
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}

const getListBookingOfUserFromDb = async (id) => {
    try {
        const res = await client.query(
            `SELECT
            b.id AS id,
            u.user_name AS hint_name,
            b.hint_id,
            b.date,
            b.price,
            b.status AS status,
            b.time,
            b.cost,
            b.quantity,
            b.note,
            b.destination_id,
            b.destination,
            b.type_travel
        FROM
            booking b
        JOIN
            "user" u ON b.hint_id = u.id
        WHERE
            b.user_id = $1
        ORDER BY b.date DESC`,
            [id]
        );
        if (res.rows) {
            return res.rows;
        }
        else {
            return null;
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}

const getRequestBookingOfPGTFromDb = async (id, type) => {
    try {
        // c.image AS category_link,
        // b.category_id,
        // JOIN
        //  category c ON b.category_id = c.id
        const res = await client.query(
            `SELECT
                b.id AS id,
                u.user_name AS hint_name,
                b.user_id as user_id,
                u2.user_name AS user_name,
                b.date,
                b.price,
                b.status AS status,
                b.time,
                b.cost,
                b.quantity,
                b.note,
                b.destination_id,
                b.destination,
                b.type_travel
            FROM
                booking b
            JOIN
                "user" u ON b.hint_id = u.id
            JOIN
                "user" u2 ON b.user_id = u2.id
            WHERE
                b.hint_id = $1
                AND b.status != 4
            ORDER BY b.created_at DESC`,
            [id]
        );
        if (res.rows) {
            return res.rows;
        }
        else {
            return null;
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}

const getListBookingFromDb = async (Keyword, DateCreate, DateBooking) => {
    try {
        let whereClause = '';
        let values = [];

        if (Keyword) {
            whereClause += ` AND (u.user_name ILIKE $1 OR u2.user_name ILIKE $1)`;
            values.push(`%${Keyword}%`);
        }

        // if (DateCreate) {
        //     whereClause += ` AND DATE(b.created_at) = $${values.length + 1}`;
        //     values.push(DateCreate);
        // }

        // if (DateBooking) {
        //     whereClause += ` AND DATE(b.date) = $${values.length + 1}`;
        //     values.push(DateBooking);
        // }

        const res = await client.query(
            `SELECT
                b.id AS id,
                u.user_name AS hint_name,
                b.user_id as user_id,
                u2.user_name AS user_name,
                b.price,
                b.status AS status,
                b.time,
                b.cost,
                b.date,
                b.quantity,
                b.note,
                b.destination_id,
                b.destination,
                b.type_travel
            FROM
                booking b
            JOIN
                "user" u ON b.hint_id = u.id
            JOIN
                "user" u2 ON b.user_id = u2.id
            WHERE 1=1 ${whereClause}
            ORDER BY b.created_at DESC`,
            values
        );
        if (res.rows) {
            return res.rows;
        } else {
            return null;
        }
    } catch (error) {
        // Handle query error
        console.error(error);
        throw error;
    }
};

const getListBookingForAccIdFromDb = async (id) => {
    try {
        const res = await client.query(
            `SELECT * FROM public.booking where hintId = $1
            ORDER BY created_at ASC`,
            [id]
        );
        if (res.rows) {
            return res.rows;
        }
        else {
            return null;
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}

const signupBookingDB = async (
    userId,
    hintId,
    date,
    category,
    cost,
    price,
    quantity,
    note,
    destination_id,
    destination,
    typeTravel,
    time) => {
    try {
        const conflictBooking = await client.query(`
            SELECT
            id,
            hint_id,
            status
            FROM
            booking
            WHERE
            hint_id = $1
            AND date = $2
            AND time =$3
            ;
        `, [hintId, date, time]);
        // Kiểm tra xem có xung đột hay không

        if (conflictBooking.rows.length > 0 && conflictBooking.rows[0].status !== 3) {
            const booking = conflictBooking.rows[0];
            const messsageError = `Interpreter đã được thuê thời gian này`;

            return {
                status: 201,
                message: "Lịch sử booking xung đột với lượt thuê mới.",
                messsageError: messsageError,
            };
        }

        //  tạo booking
        const res = await client.query(`
        INSERT INTO public.booking (
            user_id, hint_id, date, category_id, cost, price, quantity, description, destination_id, destination, type_travel, time
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id; 
         `, [
            userId,
            hintId,
            date,
            category,
            cost,
            price,
            quantity,
            note,
            destination_id,
            destination,
            typeTravel,
            time
        ]);
        if (res.rows.length > 0) {
            return {
                status: 200,
                message: "Đăng kí booking thành công.",
                bookingId: res.rows  // Trả về ID của booking
            };
        } else {
            return {
                status: 400,
                message: "Hệ thống lỗi",
            };
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}
const checkTimeBookingPgt = async (pgtId, date, timeStart, timeEnd) => {
    try {
        // Kiểm tra xem có pgt tồn tại không
        const pgtIdCheck = await client.query(`
        SELECT * FROM public."user" WHERE id = $1 AND role_id =2 ;`,
            [pgtId]);
        if (pgtIdCheck.rows.length === 0) {
            return {
                status: 400,
                message: "Không tồn tại Impterpreter"
            };
        }

        // Lấy danh sách các booking IDs có xung đột
        const conflictBooking = await client.query(`
            SELECT
            id,status, 
            FROM
            booking
            WHERE
            hintId = $1
            AND date = $2
            AND (
                (time_from <= $3 AND time_to >= $3)
                OR (time_from <= $4 AND time_to >= $4)
                OR ($3 <= time_from AND $4 >= time_from)
            );
        `, [pgtId, date, timeStart, timeEnd]);

        // Kiểm tra xem có xung đột hay không

        if (conflictBooking.rows.length > 0 && conflictBooking.rows[0].status !== 3) {
            const booking = conflictBooking.rows[0];
            const startTime = getTime(booking.time_from)
            const endTime = getTime(booking.time_to)
            const messsageError = `Impterpreter đã được thuê từ ${startTime} đến ${endTime}`;

            return {
                status: 201,
                message: "Lịch sử booking xung đột với lượt thuê mới.",
                messsageError: messsageError,
            };
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}
const updateBookingToDB = async (id, type, rate = 5, comment = '') => {
    try {
        // Kiểm tra xem có booking tồn tại không
        const bookingCheck = await client.query(`
            SELECT id FROM public."booking" WHERE id = $1;
        `, [id]);

        if (bookingCheck.rows.length === 0) {
            return {
                status: 400,
                message: "Không tồn tại lượt booking"
            };
        }

        // Xây dựng câu truy vấn UPDATE
        let updateQuery = `
            UPDATE public.booking
            SET status = $1,rate = $3,comment = $4
            WHERE id = $2
            RETURNING id; 
        `;
        // Thực hiện câu truy vấn UPDATE
        const res = await client.query(updateQuery, [type, id, rate, comment]);

        if (res.rows.length > 0) {
            return {
                status: 200,
                message: "Sửa booking thành công.",
                bookingId: res.rows[0].id // Trả về ID của booking
            };
        } else {
            return {
                status: 400,
                message: "Hệ thống lỗi",
            };
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
};

const deleteBookingInDB = async (id) => {
    try {
        // Kiểm tra xem có booking tồn tại không
        const bookingCheck = await client.query(`
         SELECT id FROM public."booking" WHERE id = $1 ;`,
            [id]);
        if (bookingCheck.rows.length === 0) {
            return {
                status: 400,
                message: "Không tồn tại lượt booking"
            };
        }
        //  delete  booking
        const res = await client.query(`
        DELETE FROM public.booking
        WHERE id = $1; 
        ;`,
            [id]);
        if (res.rowCount === 1) {
            return {
                status: 200,
                message: "Xóa booking thành công.",
            };
        } else {
            return {
                status: 400,
                message: "Hệ thống lỗi",
            };
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}
const getChartInDb = async (Year, Month, Date) => {
    try {
        let query = '';
        let queryParams = [];
        // Nếu cung cấp cả Year và Month nhưng không cung cấp Date
        // => Lấy số lượng booking theo ngày trong một tháng và tổng giá
        if (Year && Month && !Date) {
            query = `
                SELECT EXTRACT(DAY FROM date) as day, COUNT(*) as bookings, SUM(price) as total_price
                FROM public."booking"
                WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
                GROUP BY day
                ORDER BY day;
            `;
            queryParams = [Year, Month];
        }
        // Nếu chỉ cung cấp Year
        // => Lấy số lượng booking theo tháng trong một năm và tổng giá
        else if (Year && !Month) {
            query = `
                SELECT EXTRACT(MONTH FROM date) as month, COUNT(*) as bookings, SUM(price) as total_price
                FROM public."booking"
                WHERE EXTRACT(YEAR FROM date) = $1
                GROUP BY month
                ORDER BY month;
            `;
            queryParams = [Year];
        }
        // Thực thi query
        const res = await client.query(query, queryParams);
        if (res.rows) {
            return res.rows;
        } else {
            return null;
        }
    } catch (error) {
        // Handle query error
        console.error(error);
        throw error;
    }
};
const getTopBookingUsersByDuration = async (Year, Month, Date) => {
    try {
        let query = '';
        let queryParams = [];
        let whereConditions = [];
        if (Year) {
            whereConditions.push(`EXTRACT(YEAR FROM b.date) = $1`);
            queryParams.push(Year);
        }
        if (Month) {
            whereConditions.push(`EXTRACT(MONTH FROM b.date) = $2`);
            queryParams.push(Month);
        }
        if (Date) {
            whereConditions.push(`EXTRACT(DAY FROM b.date) = $3`);
            queryParams.push(Date);
        }
        let whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        query = `
        SELECT 
        b.hint_id, 
        u.user_name, 
        u.avatar, 
        SUM(EXTRACT(EPOCH FROM b.time_to) - EXTRACT(EPOCH FROM b.time_from))/60 as total_minutes,
        SUM(EXTRACT(EPOCH FROM b.time_to) - EXTRACT(EPOCH FROM b.time_from))/3600 as total_hours
        FROM public."booking" b
        INNER JOIN public."user" u ON b.hint_id = u.id
        ${whereClause}
        GROUP BY b.hint_id, u.user_name, u.avatar
        ORDER BY total_minutes DESC
        LIMIT 10;
        `;
        const res = await client.query(query, queryParams);
        if (res.rows) {
            return res.rows.map(row => ({
                hintId: row.hintId,
                user_name: row.user_name,
                avatar: row.avatar,
                total_duration_minutes: row.total_hours
            }));
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Function to get user's wallet information by userId
const getWalletByUserId = async (userId) => {
    try {
        // Implement your database query to retrieve wallet information based on userId
        const walletQuery = `
            SELECT id, money_balance
            FROM public.wallet
            WHERE user_id = $1
        `;
        const walletRes = await client.query(walletQuery, [userId]);

        return walletRes.rows[0]; // Assuming there is only one wallet per user
    } catch (error) {
        console.error(error);
        throw error;
    }
};
module.exports = {
    getListBookingForAccIdFromDb,
    signupBookingDB,
    getListBookingOfUserFromDb,
    updateBookingToDB,
    getRequestBookingOfPGTFromDb,
    getBookingDetail,
    deleteBookingInDB,
    getListBookingFromDb,
    checkTimeBookingPgt,
    getChartInDb,
    getTopBookingUsersByDuration,
    getWalletByUserId
}