const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: "Match"
        },
        sport: {
            type: String,
            default: ""
        },
        opponent: {
            type: String,
            default: "Opponent"
        },
        opponentTeam: {
            type: String,
            default: ""
        },
        venue: {
            type: String,
            default: ""
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            default: ""
        },
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            default: null
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        },
        status: {
            type: String,
            enum: ["upcoming", "completed", "cancelled"],
            default: "upcoming"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
