const express = require('express')

const hintController = require('../controllers/hintController')

const router = express.Router()
// lấy danh sách pgt
router.get('/', hintController.getHintList)
// danh sahcs bình luận
router.get('/feedback/:id', hintController.getHintFeedbackList)
//  lấy thông tin hint
router.get('/:id', hintController.getHintDetail)
// change to role hint
router.post("/:id", hintController.requestToHint);
// update request booking
router.put("/:id", hintController.acceptInfoRequestBooking);

module.exports = router