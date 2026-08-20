const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        role: {
            type: String,
            enum: [
                "admin",
                "coach",
                "student",
                "system"
            ],
            default: "system"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Activity",
    activitySchema
);