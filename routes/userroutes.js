const express = require("express");
const UserController = require("../controllers/usercontroller");
const Common = require("../config/common");

const router = express.Router();

router.post("/register_user", UserController.saveUserData); // check Signup
router.get("/user_list", Common.authenticateToken, UserController.fetchReferralUsers); //check
router.get("/profile", Common.authenticateToken, UserController.profile); //check
router.get("/delete_user", Common.authenticateToken, UserController.deleteUser); // check
router.post("/update_profile", Common.authenticateToken, UserController.updateProfile); //check

router.post("/upload", Common.upload.array("images", 5), UserController.uploadImages);

module.exports = router;
