const express = require("express");
const router = express.Router();

const {
    login,
    sendEmailVerificationOtp,
    verifyEmailVerificationOtp,
    getAvailableCoaches,
    registerStudent
} = require("../controllers/authController");

// Authentication
router.post("/login", login);

// Email OTP verification
router.post("/send-email-otp", sendEmailVerificationOtp);
router.post("/verify-email-otp", verifyEmailVerificationOtp);

// Coach list for student registration
router.get("/coaches", getAvailableCoaches);

// Student registration
router.post("/register-student", registerStudent);

module.exports = router;