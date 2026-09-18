const Student = require("../models/Student");
const Coach = require("../models/Coach");
const Team = require("../models/Team");
const Equipment = require("../models/Equipment");
const EquipmentRequest = require("../models/EquipmentRequest");
const Tournament = require("../models/Tournament");
const Schedule = require("../models/Schedule");
const Activity = require("../models/Activity");
const User = require("../models/User");

// =====================================================
// GET STUDENT DASHBOARD DATA
// =====================================================
const getStudentDashboard = async (req, res) => {
    try {
        const authUser = req.user; // { userId, email, role, _id }

        // Find Student Profile
        let student = await Student.findOne({
            $or: [
                { userId: authUser._id },
                { studentId: authUser.userId },
                { email: authUser.email }
            ]
        }).populate("coachId");

        // If not found in Student collection, create or find from User
        if (!student) {
            const userRecord = await User.findOne({ email: authUser.email });
            if (userRecord) {
                student = await Student.findOne({ userId: userRecord._id }).populate("coachId");
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student athlete profile not found. Please contact administration."
            });
        }

        // 1. Coach Info
        let coach = student.coachId;
        if (!coach && student.coachUserId) {
            coach = await Coach.findOne({
                $or: [
                    { userId: student.coachUserId },
                    { _id: student.coachUserId.match(/^[0-9a-fA-F]{24}$/) ? student.coachUserId : null }
                ]
            });
        }

        const sport = coach?.sport || "Athletics";

        // 2. Team Info
        let team = null;
        if (student.teamId) {
            team = await Team.findById(student.teamId).populate("students", "name studentId registerNumber department");
        }
        if (!team && coach) {
            team = await Team.findOne({
                $or: [
                    { _id: coach.teamId },
                    { coachId: coach._id },
                    { students: student._id }
                ]
            }).populate("students", "name studentId registerNumber department");
        }
        if (!team) {
            team = await Team.findOne({
                students: student._id
            }).populate("students", "name studentId registerNumber department");
        }

        const teamName = team?.name || coach?.teamName || `${sport} Team`;

        // 3. Equipment Requests & Issued Gear
        const equipmentRequests = await EquipmentRequest.find({
            $or: [
                { studentId: student._id },
                { studentId: null, coachId: coach?._id }
            ]
        })
            .populate("equipmentId", "name category sport status")
            .sort({ createdAt: -1 });

        const issuedEquipment = equipmentRequests.filter((req) => req.status === "approved");

        // 4. Upcoming & Active Tournaments
        const tournaments = await Tournament.find({
            status: { $in: ["upcoming", "ongoing", "in-progress", "completed"] }
        })
            .sort({ startDate: 1 });

        // 5. Upcoming Matches & Schedules
        const scheduleQueries = [{ status: { $ne: "cancelled" } }];
        if (coach?._id) {
            scheduleQueries.push({ coachId: coach._id });
            scheduleQueries.push({ coach2Id: coach._id });
        }
        if (team?._id) {
            scheduleQueries.push({ teamId: team._id });
            scheduleQueries.push({ team1Id: team._id });
            scheduleQueries.push({ team2Id: team._id });
        }
        if (sport) {
            scheduleQueries.push({ sport: { $regex: new RegExp(sport, "i") } });
        }

        const schedules = await Schedule.find({
            $or: scheduleQueries
        })
            .populate("tournamentId", "name tournamentId sport startDate endDate status venue")
            .populate("team1Id", "name sport")
            .populate("team2Id", "name sport")
            .populate("coachId", "name")
            .sort({ date: 1, startMinutes: 1 })
            .limit(10);

        // 6. Recent Activities
        const activities = await Activity.find({
            $or: [
                { userId: student.userId },
                { role: "student" },
                { type: { $in: ["Student Registration", "Equipment Request", "Match", "Tournament"] } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(8);

        return res.status(200).json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    studentId: student.studentId,
                    name: student.name,
                    email: student.email,
                    registerNumber: student.registerNumber,
                    phone: student.phone,
                    department: student.department,
                    year: student.year,
                    approvalStatus: student.approvalStatus
                },
                coach: coach
                    ? {
                          id: coach._id,
                          userId: coach.userId,
                          name: coach.name,
                          sport: coach.sport,
                          teamName: teamName,
                          email: coach.email,
                          phone: coach.phone
                      }
                    : null,
                team: {
                    id: team?._id || coach?.teamId || null,
                    teamId: team?.teamId || "-",
                    name: teamName,
                    sport: team?.sport || sport,
                    memberCount: team?.students?.length || (coach ? 1 : 0),
                    members: team?.students || []
                },
                sport,
                stats: {
                    equipmentIssuedCount: issuedEquipment.length,
                    pendingRequestsCount: equipmentRequests.filter((r) => r.status === "pending").length,
                    upcomingMatchesCount: schedules.length,
                    tournamentsCount: tournaments.length
                },
                equipmentRequests,
                issuedEquipment,
                tournaments,
                schedules,
                activities
            }
        });
    } catch (error) {
        console.error("Error in getStudentDashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load student athlete dashboard data",
            error: error.message
        });
    }
};

// =====================================================
// GET AVAILABLE EQUIPMENT FOR STUDENT
// =====================================================
const getAvailableEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({
            availableQuantity: { $gt: 0 },
            status: "available"
        }).sort({ name: 1 });

        return res.status(200).json({
            success: true,
            equipment
        });
    } catch (error) {
        console.error("Error in getAvailableEquipment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load equipment catalog",
            error: error.message
        });
    }
};

// =====================================================
// SUBMIT EQUIPMENT REQUEST
// =====================================================
const submitEquipmentRequest = async (req, res) => {
    try {
        const authUser = req.user;
        const { equipmentId, quantity, dueDate, remarks } = req.body;

        if (!equipmentId || !quantity || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Please select an equipment item and a valid quantity (minimum 1)."
            });
        }

        const student = await Student.findOne({
            $or: [
                { userId: authUser._id },
                { studentId: authUser.userId },
                { email: authUser.email }
            ]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student athlete profile not found."
            });
        }

        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Selected equipment item does not exist."
            });
        }

        if (equipment.availableQuantity < Number(quantity)) {
            return res.status(400).json({
                success: false,
                message: `Only ${equipment.availableQuantity} units available for ${equipment.name}.`
            });
        }

        const requestCount = await EquipmentRequest.countDocuments();
        const generatedRequestId = `REQ${String(requestCount + 1).padStart(3, "0")}`;

        const newRequest = await EquipmentRequest.create({
            requestId: generatedRequestId,
            equipmentId: equipment._id,
            studentId: student._id,
            coachId: student.coachId,
            quantity: Number(quantity),
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            remarks: remarks || "Requested by student athlete",
            status: "pending"
        });

        // Log Activity
        try {
            await Activity.create({
                type: "Equipment Request",
                message: `Student ${student.name} requested ${quantity}x ${equipment.name}. Status: Pending.`,
                userId: student.userId,
                role: "student"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(201).json({
            success: true,
            message: `Equipment request for ${quantity}x ${equipment.name} submitted successfully!`,
            request: newRequest
        });
    } catch (error) {
        console.error("Error in submitEquipmentRequest:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit equipment request",
            error: error.message
        });
    }
};

// =====================================================
// GET STUDENT TOURNAMENTS
// =====================================================
const getStudentTournaments = async (req, res) => {
    try {
        const { sport, status } = req.query;
        let query = { status: { $ne: "cancelled" } };

        if (sport && sport !== "all") {
            query.sport = new RegExp(`^${sport}$`, "i");
        }

        if (status && status !== "all") {
            query.status = status;
        }

        const tournaments = await Tournament.find(query).sort({ startDate: 1 });

        return res.status(200).json({
            success: true,
            count: tournaments.length,
            tournaments
        });
    } catch (error) {
        console.error("Error in getStudentTournaments:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tournaments",
            error: error.message
        });
    }
};

// =====================================================
// GET STUDENT SCHEDULES (FULL LIST)
// =====================================================
const getStudentSchedules = async (req, res) => {
    try {
        const authUser = req.user;
        let student = await Student.findOne({
            $or: [
                { userId: authUser._id },
                { studentId: authUser.userId },
                { email: authUser.email }
            ]
        }).populate("coachId");

        let coach = student?.coachId;
        let team = null;
        if (student?.teamId) {
            team = await Team.findById(student.teamId);
        }
        if (!team && coach) {
            team = await Team.findOne({
                $or: [{ coachId: coach._id }, { students: student?._id }]
            });
        }

        const scheduleQueries = [{ status: { $ne: "cancelled" } }];
        if (coach?._id) {
            scheduleQueries.push({ coachId: coach._id }, { coach2Id: coach._id });
        }
        if (team?._id) {
            scheduleQueries.push({ teamId: team._id }, { team1Id: team._id }, { team2Id: team._id });
        }
        if (coach?.sport) {
            scheduleQueries.push({ sport: new RegExp(`^${coach.sport}$`, "i") });
        }

        const schedules = await Schedule.find({ $or: scheduleQueries })
            .populate("tournamentId", "name tournamentId sport startDate endDate status venue")
            .populate("team1Id", "name sport")
            .populate("team2Id", "name sport")
            .populate("coachId", "name")
            .sort({ date: 1, startMinutes: 1 });

        return res.status(200).json({
            success: true,
            count: schedules.length,
            schedules
        });
    } catch (error) {
        console.error("Error in getStudentSchedules:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student schedules",
            error: error.message
        });
    }
};

// =====================================================
// GET STUDENT TEAM & SQUAD
// =====================================================
const getStudentTeam = async (req, res) => {
    try {
        const authUser = req.user;
        let student = await Student.findOne({
            $or: [
                { userId: authUser._id },
                { studentId: authUser.userId },
                { email: authUser.email }
            ]
        }).populate("coachId");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student athlete not found"
            });
        }

        let coach = student.coachId;
        if (!coach && student.coachUserId) {
            coach = await Coach.findOne({
                $or: [
                    { userId: student.coachUserId },
                    { _id: student.coachUserId.match(/^[0-9a-fA-F]{24}$/) ? student.coachUserId : null }
                ]
            });
        }

        let team = null;
        if (student.teamId) {
            team = await Team.findById(student.teamId).populate("students", "name studentId registerNumber department year phone email");
        }
        if (!team && coach) {
            team = await Team.findOne({
                $or: [
                    { _id: coach.teamId },
                    { coachId: coach._id },
                    { students: student._id }
                ]
            }).populate("students", "name studentId registerNumber department year phone email");
        }
        if (!team) {
            team = await Team.findOne({
                students: student._id
            }).populate("students", "name studentId registerNumber department year phone email");
        }

        // All teammates under same coach if team.students is empty
        let teammates = team?.students || [];
        if (teammates.length === 0 && coach) {
            teammates = await Student.find({
                $or: [
                    { coachId: coach._id },
                    { coachUserId: coach.userId }
                ]
            }).select("name studentId registerNumber department year phone email");
        }

        return res.status(200).json({
            success: true,
            team: {
                id: team?._id || null,
                name: team?.name || coach?.teamName || `${coach?.sport || "Sports"} Squad`,
                sport: team?.sport || coach?.sport || "Athletics",
                description: team?.description || `Official ${coach?.sport || "Sports"} squad of BIT Sports Council.`,
                coach: coach
                    ? {
                          id: coach._id,
                          name: coach.name,
                          email: coach.email,
                          phone: coach.phone,
                          sport: coach.sport,
                          experience: coach.experience
                      }
                    : null,
                memberCount: teammates.length || 1,
                members: teammates
            }
        });
    } catch (error) {
        console.error("Error in getStudentTeam:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student team details",
            error: error.message
        });
    }
};

// =====================================================
// GET STUDENT EQUIPMENT REQUESTS (FULL HISTORY)
// =====================================================
const getStudentRequests = async (req, res) => {
    try {
        const authUser = req.user;
        let student = await Student.findOne({
            $or: [
                { userId: authUser._id },
                { studentId: authUser.userId },
                { email: authUser.email }
            ]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student athlete not found"
            });
        }

        const requests = await EquipmentRequest.find({
            studentId: student._id
        })
            .populate("equipmentId", "name category sport status imageUrl condition availableQuantity totalQuantity")
            .populate("coachId", "name email phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Error in getStudentRequests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student equipment requests",
            error: error.message
        });
    }
};

// =====================================================
// GET STUDENT PROFILE
// =====================================================
const getStudentProfile = async (req, res) => {
    try {
        const authUser = req.user;
        let student = await Student.findOne({
            $or: [
                { userId: authUser._id },
                { studentId: authUser.userId },
                { email: authUser.email }
            ]
        }).populate("coachId").populate("teamId");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student athlete not found"
            });
        }

        const activeIssuedLoans = await EquipmentRequest.countDocuments({
            studentId: student._id,
            status: "approved"
        });

        return res.status(200).json({
            success: true,
            student: {
                ...student.toObject(),
                activeIssuedLoans
            }
        });
    } catch (error) {
        console.error("Error in getStudentProfile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student profile",
            error: error.message
        });
    }
};

module.exports = {
    getStudentDashboard,
    getAvailableEquipment,
    submitEquipmentRequest,
    getStudentTournaments,
    getStudentSchedules,
    getStudentTeam,
    getStudentRequests,
    getStudentProfile
};
