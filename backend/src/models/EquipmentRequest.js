const mongoose = require("mongoose");

const equipmentRequestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            unique: true,
            required: true
        },

        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null
        },

        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            default: null
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        requestDate: {
            type: Date,
            default: Date.now
        },

        dueDate: {
            type: Date
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "returned"
            ],
            default: "pending"
        },

        remarks: {
            type: String,
            default: ""
        },

        // Coach Return Tracking Fields
        returnCondition: {
            type: String,
            enum: ["good", "damaged", "partial_damaged"],
            default: "good"
        },

        damagedQuantityReturned: {
            type: Number,
            default: 0,
            min: 0
        },

        goodQuantityReturned: {
            type: Number,
            default: 0,
            min: 0
        },

        returnedByCoach: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            default: null
        },

        returnDate: {
            type: Date,
            default: null
        },

        returnRemarks: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "EquipmentRequest",
    equipmentRequestSchema
);