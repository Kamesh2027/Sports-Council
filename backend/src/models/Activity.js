const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "info"
        },

        action: {
            type: String,
            default: ""
        },

        message: {
            type: String,
            default: ""
        },

        user: {
            type: String,
            default: "Admin"
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
            default: "admin"
        },

        status: {
            type: String,
            default: "COMPLETED"
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