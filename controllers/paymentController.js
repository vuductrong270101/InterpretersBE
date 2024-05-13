const { getPaymentInDB, updatePayment, getPaymentListForUserInDB, updateMoneyWallet, updatePaymentHistory } = require("../models/paymentModel");

const getPaymentDetail = async (req, res, next) => {
    try {
        const id = req.params.id;
        const paymentDetail = await getPaymentInDB(id);
        if (paymentDetail !== null) {
            res.json({
                status: 200,
                data: paymentDetail?.data
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
}
const getPaymentListForUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const paymentDetail = await getPaymentListForUserInDB(id);
        if (paymentDetail !== null) {
            res.json({
                status: 200,
                money: paymentDetail.money,
                data: paymentDetail.data
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
}


const updatePayMentBookingForAcc = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amount, type} = req.body;
        //  thêm lịch sử giao dịch
        const reps = await updatePaymentHistory(id, amount, type);
        //  cập nhật tiền trong ví
        const result = await updateMoneyWallet(id, amount);
        if (result?.status === 200) {
            res.json({
                status: 200,
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
}
const updatePayMentStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amount, userId, status, txtNo } = req.body;
        const paymentDetail = await updatePayment(id, status, txtNo);
        const result = await updateMoneyWallet(userId, amount);
        if (paymentDetail?.status === 200) {
            res.json({
                status: 200,
                data: paymentDetail?.data
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
}
module.exports = {
    getPaymentDetail,
    getPaymentListForUser,
    updatePayMentStatus,
    updatePayMentBookingForAcc
}