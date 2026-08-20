const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
    {
        venueId: {
            type: String,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        location: {
            type: String,
            default: ""
        },

        capacity: {
            type: Number,
            default: 0
        },

        sport: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "available",
                "occupied",
                "maintenance"
            ],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Venue",
    venueSchema
);