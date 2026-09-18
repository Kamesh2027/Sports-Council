const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
    {
        tournamentId: {
            type: String,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        sport: {
            type: String,
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        venue: {
            type: String,
            default: "Main Sports Complex"
        },

        location: {
            type: String,
            default: "BIT Campus"
        },

        status: {
            type: String,
            enum: [
                "upcoming",
                "ongoing",
                "completed",
                "cancelled"
            ],
            default: "upcoming"
        },

        description: {
            type: String,
            default: ""
        },

        organizer: {
            type: String,
            default: "BIT Sports Council"
        },

        prizePool: {
            type: String,
            default: ""
        },

        maxTeams: {
            type: Number,
            default: 16
        },

        registeredTeamsCount: {
            type: Number,
            default: 0
        },

        registrationDeadline: {
            type: Date
        },

        eligibility: {
            type: String,
            default: "Open to all enrolled students"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Tournament",
    tournamentSchema
);