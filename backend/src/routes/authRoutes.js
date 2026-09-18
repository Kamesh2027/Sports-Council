const express = require("express");
const router = express.Router();

const {
    login,
    sendEmailVerificationOtp,
    verifyEmailVerificationOtp,
    getAvailableCoaches,
    registerStudent,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword
} = require("../controllers/authController");

// Authentication
router.post("/login", login);

// Email OTP verification (Student Registration)
router.post("/send-email-otp", sendEmailVerificationOtp);
router.post("/verify-email-otp", verifyEmailVerificationOtp);

// Password Reset OTP & Reset
router.post("/forgot-password", sendPasswordResetOtp);
router.post("/send-reset-otp", sendPasswordResetOtp);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);

// Coach list for student registration
router.get("/coaches", getAvailableCoaches);

// Student registration
router.post("/register-student", registerStudent);

module.exports = router;