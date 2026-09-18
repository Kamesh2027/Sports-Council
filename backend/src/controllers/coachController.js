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

        // Active Loans (Approved and eligible for return)
        const activeLoansCount = await EquipmentRequest.countDocuments({
            $or: [
                { coachId: coach._id },
                { coachUserId: coachUserId },
                { studentId: { $in: studentIds } }
            ],
            status: "approved"
        });

        // Returned Count
        const returnedLoansCount = await EquipmentRequest.countDocuments({
            $or: [
                { coachId: coach._id },
                { coachUserId: coachUserId },
                { studentId: { $in: studentIds } }
            ],
            status: "returned"
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
            .populate("studentId", "name studentId email registerNumber")
            .populate("returnedByCoach", "name coachId")
            .sort({ createdAt: -1 })
            .limit(10);

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
                pendingRequests: pendingRequests,
                activeLoans: activeLoansCount,
                returnedLoans: returnedLoansCount
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
        const coachUserId = coach?.userId || req.user?.userId;

        const students = await Student.find({
            $or: [
                { coachUserId: coachUserId },
                { coachId: coach?._id }
            ]
        });
        const studentIds = students.map((s) => s._id);

        let equipment = [];
        if (coach?.sport) {
            equipment = await Equipment.find({
                sport: new RegExp(`^${coach.sport}$`, "i")
            }).sort({ createdAt: -1 });
        } else {
            equipment = await Equipment.find().sort({ createdAt: -1 });
        }

        // Get team allocated gear
        let team = null;
        if (coach?.teamId || coach?._id) {
            team = await Team.findOne({
                $or: [
                    { _id: coach.teamId },
                    { coachId: coach._id }
                ]
            }).populate("equipments.equipmentId", "equipmentId name category sport availableQuantity status");
        }

        // Get all loans & requests for coach & squad
        const activeLoans = await EquipmentRequest.find({
            $or: [
                { coachId: coach?._id },
                { coachUserId: coachUserId },
                { studentId: { $in: studentIds } }
            ]
        })
            .populate("equipmentId")
            .populate("studentId", "name studentId registerNumber department")
            .populate("returnedByCoach", "name userId sport")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            equipment,
            team,
            activeLoans,
            students
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
            .populate("returnedByCoach", "name userId sport")
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
// RETURN EQUIPMENT BY COACH (INSTANT INVENTORY RECOVERY)
// =====================================================
const returnEquipmentByCoach = async (req, res) => {
    try {
        const coach = await findCoachProfile(req.user);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: "Coach profile not found"
            });
        }

        const { id } = req.params;
        const { condition, damagedCount, remarks } = req.body;

        const request = await EquipmentRequest.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { requestId: id }
            ]
        })
            .populate("equipmentId")
            .populate("studentId");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Equipment request record not found."
            });
        }

        if (request.status === "returned") {
            return res.status(400).json({
                success: false,
                message: "This equipment loan has already been marked as returned."
            });
        }

        const totalQty = request.quantity || 1;
        const returnCond = condition || "good"; // 'good' | 'damaged' | 'partial_damaged'
        let damagedQty = 0;

        if (returnCond === "damaged") {
            damagedQty = Math.max(1, Number(damagedCount) || totalQty);
            damagedQty = Math.min(totalQty, damagedQty);
        } else if (returnCond === "partial_damaged") {
            damagedQty = Math.max(1, Number(damagedCount) || 1);
            damagedQty = Math.min(totalQty, damagedQty);
        } else {
            damagedQty = 0;
        }

        const goodQty = Math.max(0, totalQty - damagedQty);
        const equipment = request.equipmentId;

        // Automatically update Equipment inventory counts immediately
        if (equipment) {
            equipment.availableQuantity = (equipment.availableQuantity || 0) + goodQty;
            equipment.damagedQuantity = (equipment.damagedQuantity || 0) + damagedQty;

            // Sync status
            if (equipment.availableQuantity > 0) {
                equipment.status = "available";
            } else if (equipment.damagedQuantity === equipment.totalQuantity) {
                equipment.status = "maintenance";
            } else {
                equipment.status = "out-of-stock";
            }

            await equipment.save();
        }

        // Update EquipmentRequest record
        request.status = "returned";
        request.returnCondition = returnCond;
        request.damagedQuantityReturned = damagedQty;
        request.goodQuantityReturned = goodQty;
        request.returnedByCoach = coach._id;
        request.returnDate = new Date();
        request.returnRemarks = (remarks || "").trim() || (damagedQty > 0 ? `Returned with ${damagedQty} damaged units while playing.` : "Returned in good condition.");
        await request.save();

        // If team had allocated gear, remove returned units from team.equipments
        if (coach.teamId || request.studentId?.teamId) {
            const teamId = coach.teamId || request.studentId?.teamId;
            const team = await Team.findById(teamId);
            if (team && team.equipments && equipment) {
                const eqIdx = team.equipments.findIndex(
                    (e) => String(e.equipmentId) === String(equipment._id)
                );
                if (eqIdx >= 0) {
                    team.equipments[eqIdx].quantity = Math.max(0, team.equipments[eqIdx].quantity - totalQty);
                    if (team.equipments[eqIdx].quantity === 0) {
                        team.equipments.splice(eqIdx, 1);
                    }
                    await team.save();
                }
            }
        }

        // Log Activity
        try {
            const athleteName = request.studentId?.name || "Athlete";
            const equipName = equipment?.name || "Equipment";
            const damageNote = damagedQty > 0 ? ` (${damagedQty} damaged while playing)` : " (Normal condition)";
            await Activity.create({
                type: "Equipment Return",
                message: `Coach ${coach.name} returned ${totalQty}x ${equipName} for ${athleteName}${damageNote}. Available stock updated to ${equipment?.availableQuantity || 0}.`,
                userId: coach.userId,
                role: "coach"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Equipment ${equipment?.name || "item"} return processed successfully! Available stock updated: +${goodQty} available units, +${damagedQty} damaged units.`,
            request,
            equipment
        });
    } catch (error) {
        console.error("Error returning equipment by coach:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process equipment return",
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

        const team = await Team.findOne({
            $or: [
                { coachId: coach?._id },
                { coachUserId: coachUserId }
            ]
        });

        const queryOr = [
            { coachId: coach?._id },
            { coach2Id: coach?._id },
            { coachUserId: coachUserId }
        ];

        if (team) {
            queryOr.push({ team1Id: team._id });
            queryOr.push({ team2Id: team._id });
            queryOr.push({ teamId: team._id });
        }

        if (coach?.sport) {
            queryOr.push({ sport: new RegExp(`^${coach.sport}$`, "i") });
        }

        const schedules = await Schedule.find({ $or: queryOr })
            .populate("tournamentId", "name tournamentId sport startDate endDate status venue")
            .populate("team1Id", "name sport")
            .populate("team2Id", "name sport")
            .populate("coachId", "name coachId")
            .sort({ date: 1, startMinutes: 1 });

        return res.status(200).json({
            success: true,
            count: schedules.length,
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

// =====================================================
// DIRECT RETURN EQUIPMENT (BY REQUEST ID OR EQUIPMENT ID)
// =====================================================
const returnEquipmentDirect = async (req, res) => {
    try {
        const coach = await findCoachProfile(req.user);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: "Coach profile not found"
            });
        }

        const { requestId, equipmentId, studentId, quantity, condition, damagedCount, remarks } = req.body;

        let request = null;
        let equipment = null;
        let totalQty = Math.max(1, Number(quantity) || 1);

        if (requestId) {
            request = await EquipmentRequest.findOne({
                $or: [
                    { _id: requestId.match(/^[0-9a-fA-F]{24}$/) ? requestId : null },
                    { requestId: requestId }
                ]
            })
                .populate("equipmentId")
                .populate("studentId");

            if (request) {
                equipment = request.equipmentId;
                totalQty = request.quantity || totalQty;
            }
        }

        if (!equipment && equipmentId) {
            equipment = await Equipment.findOne({
                $or: [
                    { _id: equipmentId.match(/^[0-9a-fA-F]{24}$/) ? equipmentId : null },
                    { equipmentId: equipmentId }
                ]
            });
        }

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment item not found."
            });
        }

        const returnCond = condition || "good"; // 'good' | 'damaged' | 'partial_damaged'
        let damagedQty = 0;

        if (returnCond === "damaged") {
            damagedQty = Math.max(1, Number(damagedCount) || totalQty);
            damagedQty = Math.min(totalQty, damagedQty);
        } else if (returnCond === "partial_damaged") {
            damagedQty = Math.max(1, Number(damagedCount) || 1);
            damagedQty = Math.min(totalQty, damagedQty);
        } else {
            damagedQty = 0;
        }

        const goodQty = Math.max(0, totalQty - damagedQty);

        // Update Equipment Stock
        equipment.availableQuantity = (equipment.availableQuantity || 0) + goodQty;
        equipment.damagedQuantity = (equipment.damagedQuantity || 0) + damagedQty;

        if (equipment.availableQuantity > 0) {
            equipment.status = "available";
        } else if (equipment.damagedQuantity === equipment.totalQuantity) {
            equipment.status = "maintenance";
        } else {
            equipment.status = "out-of-stock";
        }

        await equipment.save();

        // If from existing request, update it; otherwise create a returned record for audit trail
        if (request) {
            request.status = "returned";
            request.returnCondition = returnCond;
            request.damagedQuantityReturned = damagedQty;
            request.goodQuantityReturned = goodQty;
            request.returnedByCoach = coach._id;
            request.returnDate = new Date();
            request.returnRemarks = (remarks || "").trim() || (damagedQty > 0 ? `Returned with ${damagedQty} damaged units while playing.` : "Returned in good condition.");
            await request.save();
        } else {
            const count = await EquipmentRequest.countDocuments();
            const newReqId = `RET${String(count + 1).padStart(3, "0")}`;
            request = await EquipmentRequest.create({
                requestId: newReqId,
                equipmentId: equipment._id,
                studentId: studentId || null,
                coachId: coach._id,
                quantity: totalQty,
                requestDate: new Date(),
                dueDate: new Date(),
                status: "returned",
                returnCondition: returnCond,
                damagedQuantityReturned: damagedQty,
                goodQuantityReturned: goodQty,
                returnedByCoach: coach._id,
                returnDate: new Date(),
                returnRemarks: (remarks || "").trim() || (damagedQty > 0 ? `Direct coach return: ${damagedQty} damaged units while playing.` : "Direct coach return in good condition.")
            });
        }

        // Deduct from squad allocated equipment if present
        if (coach.teamId || request?.studentId?.teamId) {
            const teamId = coach.teamId || request?.studentId?.teamId;
            const team = await Team.findById(teamId);
            if (team && team.equipments) {
                const eqIdx = team.equipments.findIndex(
                    (e) => String(e.equipmentId) === String(equipment._id)
                );
                if (eqIdx >= 0) {
                    team.equipments[eqIdx].quantity = Math.max(0, team.equipments[eqIdx].quantity - totalQty);
                    if (team.equipments[eqIdx].quantity === 0) {
                        team.equipments.splice(eqIdx, 1);
                    }
                    await team.save();
                }
            }
        }

        // Log Activity
        try {
            const damageNote = damagedQty > 0 ? ` (${damagedQty} damaged while playing)` : " (Normal condition)";
            await Activity.create({
                type: "Equipment Return",
                message: `Coach ${coach.name} returned ${totalQty}x ${equipment.name}${damageNote}. Available inventory updated (+${goodQty} avail, +${damagedQty} damaged).`,
                userId: coach.userId,
                role: "coach"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Equipment '${equipment.name}' (${totalQty} units) returned successfully! Stock updated immediately.`,
            request,
            equipment
        });
    } catch (error) {
        console.error("Error in returnEquipmentDirect:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process equipment return",
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
    returnEquipmentByCoach,
    returnEquipmentDirect,
    getCoachTournaments,
    getCoachSchedules
};