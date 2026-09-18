const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        otp: {
            type: String,
            required: true
        },
        verified: {
            type: Boolean,
            default: false
        },
        purpose: {
            type: String,
            enum: ["registration", "password_reset"],
            default: "registration"
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Automatic document expiration after 15 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model("Otp", otpSchema);
