const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        teamId: {
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

        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            default: null
        },

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            }
        ],

        equipments: [
            {
                equipmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Equipment"
                },
                name: {
                    type: String,
                    default: ""
                },
                quantity: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Team", teamSchema);