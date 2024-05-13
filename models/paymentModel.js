const client = require('../db');
const { generateRandomNumber } = require('./Utils/Utils');

const paymentCreate = async (vnp_TxnRef, amount, vnp_OrderInfo ,user_id) => {
    try {
        const res = await client.query(`
        INSERT INTO public.payment(
            txn_ref, amount, description, user_id)
            VALUES ($1, $2, $3, $4)
        `, [vnp_TxnRef, amount, vnp_OrderInfo, user_id]);
        if (res.rows.length > 0) {
            return {
                status: 200,
                message: "Tạo thành công.",
                bookingId: res.rows[0]
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
const getPaymentInDB = async (id) => {
    try {
        const res = await client.query(`
            SELECT
            payment.id,
            payment.date,
            payment.description,
            payment.user_id
        FROM
            public.payment
            Where txn_ref = $1
        `, [id]);
        if (res.rows.length > 0) {
            return {
                status: 200,
                data: res.rows[0]
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
const getPaymentListForUserInDB = async (id) => {
    try {
        const res = await client.query(`
        SELECT * FROM public.payment
        Where user_id = $1
        ORDER BY date DESC
        `, [id]);
        const resWallet = await client.query(`
        SELECT money_balance FROM public.wallet
        Where user_id = $1
        `, [id]);
        if (res.rows.length > 0 && resWallet.rows.length> 0 ) {
            return {
                status: 200,
                money: resWallet.rows[0].money_balance,
                data: res.rows
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
const updatePayment = async (id, status,txnNo) => {
    try {
        const res = await client.query(`
        UPDATE public.payment
        SET  status= $2 ,txn_no = $3
        WHERE txn_ref =  $1   
        `, [id,status,txnNo]);
        if (res.rowCount == 1 ) {
            return {
                status: 200,
                data: 'done'
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
const updateMoneyWallet = async (user_id, amount,isAdd = true) => {
    try {
        // Check if the wallet with the given id exists
        const checkWalletQuery = `
            SELECT  money_balance
            FROM public.wallet
            WHERE user_id = $1
        `;
        const checkWalletRes = await client.query(checkWalletQuery, [user_id]);

        if (checkWalletRes.rows.length === 1) {
            // Wallet exists, update the money_balance
            const currentMoneyBalance = checkWalletRes.rows[0].money_balance;
            const newMoneyBalance = isAdd ? ( currentMoneyBalance + amount ): (currentMoneyBalance - amount);

            const updateWalletQuery = `
                UPDATE public.wallet
                SET money_balance = $1
                WHERE user_id = $2
            `;
            const updateWalletRes = await client.query(updateWalletQuery, [newMoneyBalance, user_id]);

            if (updateWalletRes.rowCount === 1) {
                return {
                    status: 200,
                    data: 'done'
                };
            } else {
                return {
                    status: 400,
                    message: "Hệ thống lỗi",
                };
            }
        } else {
            // Wallet does not exist, create a new one
            const insertWalletQuery = `
                INSERT INTO public.wallet(user_id, money_balance)
                VALUES ($1, $2)
            `;
            await client.query(insertWalletQuery, [user_id, amount]);

            return {
                status: 200,
                data: 'done'
            };
        }
    } catch (error) {
        // Handle query errors
        console.error(error);
        throw error;
    }
}
const updatePaymentHistory = async (user_id, amountMoney,type = 0,user_name) => {
    try {
        let description = '';
        if ( type == 0 ){
             description = 'Thanh toán Booking Pgt';
        }
        if ( type == 10 ){
             description = 'Hoàn tiền do hủy Booking';
        }
        if ( type == 20 ){
             description = 'Phí lượt booking thành công từ' + ' ' + user_name;
        }
        const vnp_TxnRef =  generateRandomNumber();
        const res = await client.query(`
        INSERT INTO public.payment(
            txn_ref, amount, description, user_id,status)
            VALUES ($1, $2, $3, $4,$5)
        `, [vnp_TxnRef, amountMoney, description, user_id,2]);
    } catch (error) {
        // Handle query errors
        console.error(error);
        throw error;
    }
}

module.exports = {
    paymentCreate,
    getPaymentInDB,
    getPaymentListForUserInDB,
    updatePayment,
    updateMoneyWallet,
    updatePaymentHistory
}