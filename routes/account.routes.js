const express = require("express");

// controller functions
const accountController = require("../controllers/account.controller");

const router = express.Router();
//list account user
router.get("/", accountController.getListAccount);
// login route
router.post("/login", accountController.loginAccount);
//edit info
router.put("/:id", accountController.updateAccountInfo);
// update photo 
router.put("/photo/:id", accountController.updateAccountPhotoList);
// signup route
router.post("/signup", accountController.signupAccount);

module.exports = router;
