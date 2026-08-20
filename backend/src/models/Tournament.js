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