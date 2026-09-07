const Coach = require("../models/Coach");
const Student = require("../models/Student");
const Team = require("../models/Team");
const Equipment = require("../models/Equipment");
const EquipmentRequest = require("../models/EquipmentRequest");
const Tournament = require("../models/Tournament");
const Venue = require("../models/Venue");
const Activity = require("../models/Activity");
const Schedule = require("../models/Schedule");

// Helper function to find coach from JWT user
const findCoachProfile = async (reqUser) => {
    if (!reqUser) return null;
    const coachUserId = reqUser.userId;
    let coach = await Coach.findOne({
        $or: [
            { userId: coachUserId },
            { email: reqUser.email },
            { _id: coachUserId && coachUserId.match(/^[0-9a-fA-F]{24}$/) ? coachUserId : null }
        ]
    });
    return coach;
};

// =====================================================
// GET COACH DASHBOARD
// =====================================================
const getCoachDashboard = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const coach = await findCoachProfile(req.user);

        if (!coach) {
            return res.status(404).json({
                success: false,
                message: "Coach profile not found"
            });
        }

        const coachUserId = coach.userId || req.user.userId;

        // Team
        const team = await Team.findOne({
            $or: [
                { coachId: coach._id },
                { coachUserId: coachUserId },
                { _id: coach.teamId }
            ]
        });

        // Students
        const students = await Student.find({
            $or: [
                { coachUserId: coachUserId },
                { coachId: coach._id }
            ]
        }).sort({ createdAt: -1 });

        const studentIds = students.map((s) => s._id);

        // Equipment
        let equipment = [];
        if (coach.sport) {
            equipment = await Equipment.find({
                sport: new RegExp(`^${coach.sport}$`, "i")
            }).sort({ createdAt: -1 });
        } else {
            equipment = await Equipment.find().sort({ createdAt: -1 });
        }

        // Pending Requests
        const pendingRequests = await EquipmentRequest.countDocuments({
            $or: [
                { coachId: coach._id },
                { coachUserId: coachUserId },
                { studentId: { $in: studentIds } }
            ],
            status: "pending"
        });

        // Recent Requests
        const rawRequests = await EquipmentRequest.find({
            $or: [
                { coachId: coach._id },
                { coachUserId: coachUserId },
                { studentId: { $in: studentIds } }
            ]
        })
            .populate("equipmentId")
            .populate("studentId")
            .sort({ createdAt: -1 })
            .limit(5);

        const requests = rawRequests.map((request) => {
            const requestObject = request.toObject();
            return {
                ...requestObject,
                equipment: requestObject.equipmentId,
                equipmentName: requestObject.equipmentId?.name || "Equipment"
            };
        });

        // Activities
        const rawActivities = await Activity.find({
            $or: [
                { coachUserId: coachUserId },
                { role: "coach" }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(10);

        const activities = rawActivities.map((activity) => {
            const activityObject = activity.toObject();
            return {
                ...activityObject,
                action:
                    activityObject.action ||
                    activityObject.message ||
                    activityObject.type ||
                    "Activity logged"
            };
        });

        // Tournaments
        const tournaments = await Tournament.find({
            status: {
                $in: [
                    "upcoming",
                    "ongoing",
                    "in-progress",
                    "In Progress"
                ]
            }
        })
            .sort({ startDate: 1 })
            .limit(5);

        // Venues
        const venues = await Venue.find().sort({ name: 1 });

        // Matches / Schedules
        let matches = [];
        try {
            matches = await Schedule.find({
                $or: [
                    { coachId: coach._id },
                    { coachUserId: coachUserId },
                    { sport: new RegExp(`^${coach.sport}$`, "i") }
                ]
            })
                .sort({ date: 1 })
                .limit(5);
        } catch (scheduleError) {
            console.log("Schedule fetch error:", scheduleError.message);
        }

        return res.status(200).json({
            success: true,
            stats: {
                teams: team ? 1 : 0,
                students: students.length,
                equipment: equipment.length,
                pendingRequests: pendingRequests
            },
            coach: coach,
            team: team || null,
            students: students,
            equipment: equipment,
            requests: requests,
            activities: activities,
            tournaments: tournaments,
            venues: venues,
            matches: matches
        });
    } catch (error) {
        console.error("Coach dashboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load coach dashboard",
            error: error.message
        });
    }
};

// =====================================================
// GET COACH STUDENTS
// =====================================================
const getCoachStudents = async (req, res) => {
    try {
        const coach = await findCoachProfile(req.user);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: "Coach profile not found"
            });
        }

        const coachUserId = coach.userId || req.user.userId;
        const students = await Student.find({
            $or: [
                { coachUserId: coachUserId },
                { coachId: coach._id }
            ]
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        console.error("Failed to fetch coach students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch students",
            error: error.message
        });
    }
};

// =====================================================
// GET COACH TEAM
// =====================================================
const getCoachTeam = async (req, res) => {
    try {
        const coach = await findCoachProfile(req.user);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: "Coach profile not found"
            });
        }

        const coachUserId = coach.userId || req.user.userId;
        let team = await Team.findOne({
            $or: [
                { coachId: coach._id },
                { coachUserId: coachUserId },
                { _id: coach.teamId }
            ]
        })
            .populate("students", "name studentId email registerNumber department")
            .populate("equipments.equipmentId", "equipmentId name category sport status");

        const students = await Student.find({
            $or: [
                { coachUserId: coachUserId },
                { coachId: coach._id },
                { teamId: coach.teamId }
            ]
        }).sort({ name: 1 });

        if (!team) {
            return res.status(200).json({
                success: true,
                team: {
                    name: coach.teamName || `${coach.sport || "Athletics"} Team`,
                    sport: coach.sport || "Athletics",
                    status: "Active",
                    students: students
                }
            });
        }

        const teamObj = team.toObject();
        if (!teamObj.students || teamObj.students.length === 0) {
            teamObj.students = students;
        }

        return res.status(200).json({
            success: true,
            team: teamObj
        });
    } catch (error) {
        console.error("Failed to fetch coach team:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch team",
            error: error.message
        });
    }
};

// =====================================================
// GET COACH EQUIPMENT
// =====================================================
const getCoachEquipment = async (req, res) => {
    try {
        const coach = await findCoachProfile(req.user);
        let equipment = [];

        if (coach?.sport) {
            equipment = await Equipment.find({
                sport: new RegExp(`^${coach.sport}$`, "i")
            }).sort({ createdAt: -1 });
        } else {
            equipment = await Equipment.find().sort({ createdAt: -1 });
        }

        return res.status(200).json({
            success: true,
            equipment
        });
    } catch (error) {
        console.error("Failed to fetch coach equipment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch equipment",
            error: error.message
        });
    }
};

// =====================================================
// GET COACH REQUESTS
// =====================================================
const getCoachRequests = async (req, res) => {
    try {
        const coach = await findCoachProfile(req.user);
        const coachUserId = coach?.userId || req.user?.userId;

        const students = await Student.find({
            $or: [
                { coachUserId: coachUserId },
                { coachId: coach?._id }
            ]
        });
        const studentIds = students.map((s) => s._id);

        const rawRequests = await EquipmentRequest.find({
            $or: [
                { coachId: coach?._id },
                { coachUserId: coachUserId },
                { studentId: { $in: studentIds } }
            ]
        })
            .populate("equipmentId")
            .populate("studentId")
            .sort({ createdAt: -1 });

        const requests = rawRequests.map((request) => {
            const requestObj = request.toObject();
            return {
                ...requestObj,
                equipment: requestObj.equipmentId,
                equipmentName: requestObj.equipmentId?.name || "Equipment"
            };
        });

        return res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Failed to fetch coach requests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch equipment requests",
            error: error.message
        });
    }
};

// =====================================================
// GET COACH TOURNAMENTS
// =====================================================
const getCoachTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ startDate: 1 });
        return res.status(200).json({
            success: true,
            tournaments
        });
    } catch (error) {
        console.error("Failed to fetch tournaments:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tournaments",
            error: error.message
        });
    }
};

// =====================================================
// GET COACH SCHEDULES
// =====================================================
const getCoachSchedules = async (req, res) => {
    try {
        const coach = await findCoachProfile(req.user);
        const coachUserId = coach?.userId || req.user?.userId;

        const schedules = await Schedule.find({
            $or: [
                { coachId: coach?._id },
                { coachUserId: coachUserId },
                { sport: new RegExp(`^${coach?.sport}$`, "i") }
            ]
        })
            .populate("teamId")
            .sort({ date: 1 });

        return res.status(200).json({
            success: true,
            schedules
        });
    } catch (error) {
        console.error("Failed to fetch coach schedules:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch schedules",
            error: error.message
        });
    }
};

module.exports = {
    getCoachDashboard,
    getCoachStudents,
    getCoachTeam,
    getCoachEquipment,
    getCoachRequests,
    getCoachTournaments,
    getCoachSchedules
};