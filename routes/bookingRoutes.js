const express = require('express')

const bookingController = require('../controllers/bookingController')

const router = express.Router()

// danh sách lịch sử  booking của 1 user 
router.get('/user/:id', bookingController.getHistoryBookingUser)

// danh sách yêu cầu booking của pgt
router.get('/hint/:id', bookingController.getListRequestBooking)

// List  booking  của 1 pgt
router.post('/pgt/:id', bookingController.getBookingListOfPgt)

// Tạo booking
router.post('/', bookingController.createBooking)
// check time 
router.post('/time', bookingController.checkTimeBookingPgt)

// xóa booking
router.delete('/:id', bookingController.deleteBooking)
// cập nhật booking
router.put('/:id', bookingController.updateBooking)
// Danh sách toàn bộ lượt booking (specific route)
router.get('/chart', bookingController.getChart)
router.get('/top', bookingController.getTopBookingPgt)
// Chi tiết booking (generic parameterized route)
router.get('/:id', bookingController.getDetailBooking)
// Danh sách toàn bộ lượt booking (route to get list of all bookings)
router.get('/', bookingController.getListBooking)
module.exports = router
