const mongoose = require("mongoose");

const coachSchema = new mongoose.Schema(
    {
        coachId: {
            type: String,
            unique: true,
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

        sport: {
            type: String,
            required: true
        },

        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        },

        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Coach", coachSchema);