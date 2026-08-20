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
            unique: true,
            required: true
        },

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Team", teamSchema);