const moment = require('moment-timezone');
const bookingModel = require('../models/bookingModel');
const { updateMoneyWallet, updatePaymentHistory } = require('../models/paymentModel');

const getHistoryBookingUser = async (req, res) => {
    try {
        const id = req.params.id;
        const listBooking = await bookingModel.getListBookingOfUserFromDb(id);

        if (listBooking !== null) {
            res.json({
                status: 200,
                data: listBooking
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi hoặc không có booking cho User có ID này"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const getListRequestBooking = async (req, res) => {
    try {
        const id = req.params.id;
        const listBooking = await bookingModel.getRequestBookingOfPGTFromDb(id);

        if (listBooking !== null) {
            res.json({
                status: 200,
                data: listBooking
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi hoặc không có booking cho User có ID này"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};
const getBookingListOfPgt = async (req, res) => {
    try {
        const id = req.params.id;
        const listBooking = await bookingModel.getListBookingForAccIdFromDb(id);

        if (listBooking !== null) {
            res.json({
                status: 200,
                data: listBooking
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi hoặc không có booking cho Impterpreter có ID này"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};
const getListBooking = async (req, res) => {
    const { Keyword, DateCreate, DateBooking } = req.query
    const keyword = Keyword ? Keyword.trim() : '';
    try {
        const listBooking = await bookingModel.getListBookingFromDb(keyword, DateCreate, DateBooking);
        if (listBooking !== null) {
            res.json({
                status: 200,
                data: listBooking
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

///
const createBooking = async (req, res) => {
    const data = req.body;
    try {
        if (
            !data.hasOwnProperty('userId')
            || !data.hasOwnProperty('hintId')
            || !data.hasOwnProperty('date')
            // || !data.hasOwnProperty('category') 
        ) {
            return res.status(400).json({ error: 'userId, pgtId,timeStart,timeEnd là bắt buộc' });
        }

        if (!data.date || !Date.parse(data.date)) {
            return res.status(400).json({ error: 'Ngày không hợp lệ' });
        }

        let date = moment(data.date).tz('Asia/Ho_Chi_Minh').format();
        const note = (data.note);
        // Retrieve user's wallet information
        const userWallet = await bookingModel.getWalletByUserId(data.userId);
        // Check if the balance is sufficient for the booking
        const bookingAmount = parseInt(data?.price) || 0;
        if (!userWallet || userWallet.money_balance < bookingAmount) {
            return res.status(220).json({ status: 220, message: 'Số dư trong ví không đủ' });
        }else{
            await updateMoneyWallet(data.userId, bookingAmount,false);
            await updatePaymentHistory(data.userId, bookingAmount);
        }

        const response = await bookingModel.signupBookingDB(
            data.userId,
            data.hintId,
            date,
            data.category,
            parseInt(data?.cost),
            parseInt(data?.price),
            data.quantity,
            data.note,
            data.destination_id,
            data.destination,
            data.typeTravel,
            data.time,
        );
        res.json({
            status: response?.status,
            message: response.message,
            messsageError: response?.messsageError,
            data: response?.bookingId

        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });

    }

};


const checkTimeBookingPgt = async (req, res) => {
    const data = req.body;
    try {
        if (
            !data.hasOwnProperty('pgtId')
            || !data.hasOwnProperty('date')
            || !data.hasOwnProperty('timeStart')
            || !data.hasOwnProperty('timeEnd')
        ) {
            return res.status(400).json({ error: 'Hãy chọn ngày trước' });
        }
        if (!data.date || !Date.parse(data.date)) {
            return res.status(400).json({ error: 'Ngày không hợp lệ' });
        }
        if (!data.timeStart || !Date.parse(data.timeStart || !data.timeStart || !Date.parse(data.timeStart))) {
            return res.status(400).json({ error: 'Thời gian bắt dầu và kết thúc không hợp lệ' });
        }
        const formattedTimeStart = moment(data.timeStart).tz('Asia/Ho_Chi_Minh').format('HH:mm:ssZ');
        const formattedTimeEnd = moment(data.timeEnd).tz('Asia/Ho_Chi_Minh').format('HH:mm:ssZ');

        let date = moment(data.date).tz('Asia/Ho_Chi_Minh').format();
        const response = await bookingModel.checkTimeBookingPgt(
            data.pgtId,
            date,
            formattedTimeStart,
            formattedTimeEnd,
        );
        res.json({
            status: response?.status,
            message: response?.message,
            messsageError: response?.messsageError,
            data: response?.bookingId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const { rate,user_name, comment, pgt_id,amount } = req.body;

        const response = await bookingModel.updateBookingToDB(id, type, rate, comment);
        if ( parseInt(type) == 5){
            const reps = await updatePaymentHistory(pgt_id, amount,20,user_name);
            const result = await updateMoneyWallet(pgt_id, amount);
        }
        if (response !== null) {
            res.json({
                status: response.status,
                message: response.message,
                data: response.bookingId
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi hoặc không có booking cho Impterpreter có ID này"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
}
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await bookingModel.deleteBookingInDB(id);
        if (response !== null) {
            res.json({
                status: response.status,
                message: response.message,
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi hoặc không có booking  có ID này"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
}

const getDetailBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingDetail = await bookingModel.getBookingDetail(id);

        if (bookingDetail !== null) {
            res.json({
                status: 200,
                data: bookingDetail
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi hoặc không có booking có ID này"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const getChart = async (req, res) => {
    const { Year, Month, Date } = req.query
    try {
        const chartResult = await bookingModel.getChartInDb(Year, Month, Date);
        if (chartResult !== null) {
            res.json({
                status: 200,
                data: chartResult
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};
const getTopBookingPgt = async (req, res) => {
    const { Year, Month, Date } = req.query
    try {
        const chartResult = await bookingModel.getTopBookingUsersByDuration(Year, Month, Date);
        if (chartResult !== null) {
            res.json({
                status: 200,
                data: chartResult
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Hệ thống lỗi"
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {
    getBookingListOfPgt,
    getHistoryBookingUser,
    getListRequestBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    getDetailBooking,
    getListBooking,
    checkTimeBookingPgt,
    getChart,
    getTopBookingPgt
}