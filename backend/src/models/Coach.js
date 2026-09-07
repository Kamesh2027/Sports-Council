const mongoose = require("mongoose");

const coachSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true
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

        phone: {
            type: String,
            default: ""
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other", ""],
            default: "Male"
        },

        sport: {
            type: String,
            default: "General Athletics"
        },

        teamName: {
            type: String,
            default: ""
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

module.exports = mongoose.model("Coach", coachSchema);