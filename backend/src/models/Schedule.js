const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
    {
        scheduleId: {
            type: String,
            unique: true,
            required: true
        },

        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            default: null
        },

        tournamentName: {
            type: String,
            default: ""
        },

        title: {
            type: String,
            required: true,
            default: "Match"
        },

        sport: {
            type: String,
            required: true,
            default: "Cricket"
        },

        round: {
            type: String,
            default: "League Match"
        },

        team1Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        },

        team1Name: {
            type: String,
            default: ""
        },

        team2Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        },

        team2Name: {
            type: String,
            default: ""
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

        coach2Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            default: null
        },

        venue: {
            type: String,
            required: true
        },

        venueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Venue",
            default: null
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true,
            default: "10:00"
        },

        endTime: {
            type: String,
            required: true,
            default: "12:00"
        },

        startMinutes: {
            type: Number,
            default: 600
        },

        endMinutes: {
            type: Number,
            default: 720
        },

        status: {
            type: String,
            enum: [
                "scheduled",
                "upcoming",
                "in-progress",
                "ongoing",
                "completed",
                "postponed",
                "cancelled"
            ],
            default: "scheduled"
        },

        score: {
            type: String,
            default: ""
        },

        winnerTeamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        },

        winnerName: {
            type: String,
            default: ""
        },

        referee: {
            type: String,
            default: ""
        },

        remarks: {
            type: String,
            default: ""
        },

        // Legacy compatibility aliases
        opponent: {
            type: String,
            default: ""
        },

        opponentTeam: {
            type: String,
            default: ""
        },

        time: {
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

module.exports = mongoose.model("Schedule", scheduleSchema);
