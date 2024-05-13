const express = require('express')

const router = express.Router()
let $ = require('jquery');
const request = require('request');
const moment = require('moment');
const { await } = require('await');
const { paymentCreate } = require('../models/paymentModel');
const { getPaymentDetail, getPaymentListForUser, updatePayMentStatus, updatePayMentBookingForAcc } = require('../controllers/paymentController');
//  tao giao dịch payment qua ngân hàng
router.post('/create_payment_url', async function (req, res, next) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    let config = require('config');
    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnpUrl = config.get('vnp_Url');
    let returnUrl = config.get('vnp_ReturnUrl');
    let orderId = moment(date).format('DDHHmmss');

    let { userId,amount } = req.body;
    let bankCode = req.body.bankCode;
    let locale = req.body.language;
    

    locale = 'vn';
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    const description = `Nạp tiền vào ví`;
    vnp_Params['vnp_OrderInfo'] = description;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    // const Money = amount / 100;
    //  tạo ra một payment để ghi lại thông tin dữ liệu trong hệ thông postgre
    await paymentCreate(orderId, amount, description, userId);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    if (vnpUrl) {
        return res.status(200).json({
            status: 200,
            url: vnpUrl
        });
    }
});
//  tao giao dịch payment qua ngân hàng
router.get('/user/:id', getPaymentListForUser) 
//  cập nhật tiền cho tài khoản 
router.put('/user/:id', updatePayMentBookingForAcc) 

router.get('/:id', getPaymentDetail) 

// xác nhận trạng thái hoàn thành giao dịch 
router.put('/:id', updatePayMentStatus) 

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


module.exports = router