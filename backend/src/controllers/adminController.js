const Coach = require("../models/Coach");
const Student = require("../models/Student");
const Team = require("../models/Team");
const Equipment = require("../models/Equipment");
const EquipmentRequest = require("../models/EquipmentRequest");
const Tournament = require("../models/Tournament");
const Venue = require("../models/Venue");
const Activity = require("../models/Activity");

const getDashboard = async (req, res) => {
    try {

        const [
            coaches,
            students,
            teams,
            equipment,
            pendingRequests,
            activities,
            tournaments,
            venues
        ] = await Promise.all([

            Coach.countDocuments(),

            Student.countDocuments(),

            Team.countDocuments(),

            Equipment.countDocuments(),

            EquipmentRequest.countDocuments({
                status: "pending"
            }),

            Activity.find()
                .sort({ createdAt: -1 })
                .limit(10),

            Tournament.find({
                status: {
                    $in: [
                        "upcoming",
                        "ongoing"
                    ]
                }
            })
                .sort({ startDate: 1 })
                .limit(5),

            Venue.find()
                .sort({ name: 1 })
        ]);

        res.status(200).json({
            success: true,

            stats: {
                coaches,
                students,
                teams,
                equipment,
                pendingRequests
            },

            activities,
            tournaments,
            venues
        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard data",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard
};