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
            unique: true
        },

        registerNumber: {
            type: String,
            required: true,
            unique: true
        },

        department: {
            type: String,
            required: true
        },

        year: {
            type: Number,
            required: true
        },

        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            required: true
        },

        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);