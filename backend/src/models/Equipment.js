const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
    {
        equipmentId: {
            type: String,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        sport: {
            type: String,
            required: true
        },

        totalQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        availableQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        damagedQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "available",
                "out-of-stock",
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
    "Equipment",
    equipmentSchema
);