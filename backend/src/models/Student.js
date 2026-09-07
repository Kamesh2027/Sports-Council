const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            unique: true,
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        registerNumber: {
            type: String,
            required: true,
            unique: true
        },

        phone: {
            type: String,
            default: ""
        },

        department: {
            type: String,
            default: "General"
        },

        year: {
            type: Number,
            default: 1
        },

        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            default: null
        },

        coachUserId: {
            type: String,
            default: ""
        },

        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        },

        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);