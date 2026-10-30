const Coach = require("../models/Coach");
const Student = require("../models/Student");
const Team = require("../models/Team");
const Equipment = require("../models/Equipment");
const EquipmentRequest = require("../models/EquipmentRequest");
const Tournament = require("../models/Tournament");
const Venue = require("../models/Venue");
const Activity = require("../models/Activity");
const User = require("../models/User");
const Schedule = require("../models/Schedule");
const bcrypt = require("bcryptjs");

// =====================================================
// GET ADMIN DASHBOARD
// =====================================================
const getDashboard = async (req, res) => {
    try {
        const [
            coaches,
            students,
            teams,
            equipment,
            pendingRequests,
            pendingStudents,
            activities,
            tournaments,
            venues
        ] = await Promise.all([
            Coach.countDocuments(),
            Student.countDocuments(),
            Team.countDocuments(),
            Equipment.countDocuments(),
            EquipmentRequest.countDocuments({ status: "pending" }),
            Student.countDocuments({ approvalStatus: "pending" }),
            Activity.find().sort({ createdAt: -1 }).limit(15),
            Tournament.find({
                status: { $in: ["upcoming", "ongoing"] }
            }).sort({ startDate: 1 }).limit(5),
            Venue.find().sort({ name: 1 })
        ]);

        const formattedActivities = activities.map((act) => {
            const rawAction = act.action || act.message || act.type || "System Activity";
            const rawUser = act.user || (act.role ? act.role.toUpperCase() : "ADMIN");
            
            let status = act.status || "COMPLETED";
            const typeLower = (act.type || "").toLowerCase();
            const actionLower = rawAction.toLowerCase();
            if (actionLower.includes("reject") || typeLower.includes("reject")) {
                status = "REJECTED";
            } else if (actionLower.includes("pending") || typeLower.includes("pending")) {
                status = "PENDING";
            } else if (actionLower.includes("approved") || typeLower.includes("approve")) {
                status = "APPROVED";
            } else if (actionLower.includes("update") || typeLower.includes("update") || actionLower.includes("edit")) {
                status = "UPDATED";
            } else if (actionLower.includes("delete") || actionLower.includes("remove")) {
                status = "DELETED";
            } else if (actionLower.includes("add") || actionLower.includes("created") || actionLower.includes("registered") || actionLower.includes("assigned")) {
                status = "CREATED";
            }

            return {
                _id: act._id,
                action: rawAction,
                message: act.message || rawAction,
                user: rawUser,
                role: act.role || "admin",
                status: status,
                type: (actionLower.includes("reject") || typeLower.includes("reject") || actionLower.includes("delete"))
                    ? "danger"
                    : (actionLower.includes("pending") || typeLower.includes("pending"))
                    ? "warning"
                    : "success",
                createdAt: act.createdAt
            };
        });

        res.status(200).json({
            success: true,
            stats: {
                coaches,
                students,
                teams,
                equipment,
                pendingRequests,
                pendingStudents
            },
            activities: formattedActivities,
            tournaments,
            venues
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load dashboard data",
            error: error.message
        });
    }
};

// =====================================================
// ADD NEW COACH
// =====================================================
const addCoach = async (req, res) => {
    try {
        const { name, coachId, contactNumber, phone, email, gender, sport, teamName, password } = req.body;

        const cleanName = (name || "").trim();
        const cleanCoachId = (coachId || "").trim().toUpperCase();
        const cleanPhone = (contactNumber || phone || "").trim();
        const cleanEmail = (email || "").trim().toLowerCase();
        const cleanGender = (gender || "Male").trim();
        const cleanSport = (sport || "General Athletics").trim();
        const cleanTeamName = (teamName || "").trim() || `${cleanSport} Team`;
        const rawPassword = (password || "Coach@123").trim();

        if (!cleanName || !cleanCoachId || !cleanEmail) {
            return res.status(400).json({
                success: false,
                message: "Coach Name, Coach ID, and Email Address are required."
            });
        }

        if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit contact number."
            });
        }

        // Check if Coach ID or Email already exists
        const existingCoach = await Coach.findOne({
            $or: [
                { userId: cleanCoachId },
                { email: cleanEmail }
            ]
        });

        if (existingCoach) {
            return res.status(400).json({
                success: false,
                message: existingCoach.userId === cleanCoachId
                    ? `Coach ID '${cleanCoachId}' is already registered. Please choose a unique Coach ID.`
                    : `Email '${cleanEmail}' is already registered to another coach.`
            });
        }

        // Hash password and create User account for Coach login
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        let user = await User.findOne({
            $or: [
                { email: cleanEmail },
                { userId: cleanCoachId }
            ]
        });

        if (!user) {
            user = await User.create({
                userId: cleanCoachId,
                name: cleanName,
                email: cleanEmail,
                password: hashedPassword,
                role: "coach",
                status: "active"
            });
        } else {
            user.role = "coach";
            user.status = "active";
            await user.save();
        }

        // Create Coach profile
        const newCoach = await Coach.create({
            userId: cleanCoachId,
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            gender: cleanGender,
            sport: cleanSport,
            teamName: cleanTeamName
        });

        // Automatically create or link the Team for this coach
        try {
            let existingTeam = await Team.findOne({
                $or: [
                    { coachId: newCoach._id },
                    { name: cleanTeamName }
                ]
            });

            if (!existingTeam) {
                const teamCount = await Team.countDocuments();
                const generatedTeamId = `TEAM${String(teamCount + 1).padStart(3, "0")}`;
                const newTeam = await Team.create({
                    teamId: generatedTeamId,
                    name: cleanTeamName,
                    sport: cleanSport,
                    coachId: newCoach._id,
                    students: []
                });
                newCoach.teamId = newTeam._id;
                newCoach.teamName = newTeam.name;
                await newCoach.save();
            } else {
                existingTeam.name = cleanTeamName;
                existingTeam.coachId = newCoach._id;
                existingTeam.sport = cleanSport;
                await existingTeam.save();
                newCoach.teamId = existingTeam._id;
                newCoach.teamName = existingTeam.name;
                await newCoach.save();
            }
        } catch (teamErr) {
            console.warn("Auto team linkage skipped:", teamErr.message);
        }

        // Log Admin Activity
        try {
            await Activity.create({
                type: "Coach Added",
                message: `Admin registered Coach ${cleanName} (${cleanCoachId}) for Team '${cleanTeamName}' (${cleanSport}).`,
                role: "admin"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(201).json({
            success: true,
            message: `Coach ${cleanName} (${cleanCoachId}) assigned to '${cleanTeamName}' successfully!`,
            coach: newCoach
        });

    } catch (error) {
        console.error("Error adding coach:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add coach",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL COACHES (FOR ADMIN MANAGEMENT)
// =====================================================
const getAllCoaches = async (req, res) => {
    try {
        const coaches = await Coach.find().sort({ createdAt: -1 });

        const coachesWithDetails = await Promise.all(
            coaches.map(async (coach) => {
                const coachObj = coach.toObject();
                const studentCount = await Student.countDocuments({
                    $or: [
                        { coachUserId: coach.userId },
                        { coachId: coach._id }
                    ]
                });
                const team = await Team.findOne({
                    $or: [
                        { coachId: coach._id },
                        { coachUserId: coach.userId },
                        { _id: coach.teamId }
                    ]
                });
                return {
                    ...coachObj,
                    studentCount,
                    teamName: coach.teamName || team?.name || `${coach.sport || "Athletics"} Team`,
                    teamIdStr: team?.teamId || "-"
                };
            })
        );

        return res.status(200).json({
            success: true,
            count: coachesWithDetails.length,
            coaches: coachesWithDetails
        });
    } catch (error) {
        console.error("Error fetching coaches:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load coaches list",
            error: error.message
        });
    }
};

// =====================================================
// DELETE COACH
// =====================================================
const deleteCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const coach = await Coach.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { userId: id }
            ]
        });

        if (!coach) {
            return res.status(404).json({
                success: false,
                message: "Coach not found"
            });
        }

        await Coach.findByIdAndDelete(coach._id);
        await User.findOneAndDelete({ userId: coach.userId });

        // Unlink from Team
        await Team.updateMany({ coachId: coach._id }, { $unset: { coachId: 1 } });

        // Log Activity
        try {
            await Activity.create({
                type: "Coach Removed",
                message: `Admin removed Coach ${coach.name} (${coach.userId}).`,
                role: "admin"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Coach ${coach.name} (${coach.userId}) was removed successfully.`
        });
    } catch (error) {
        console.error("Error deleting coach:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete coach",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL STUDENTS (FOR ADMIN MANAGEMENT)
// =====================================================
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate("userId", "userId name email role status createdAt")
            .populate("coachId", "userId name sport email phone gender teamName")
            .populate("teamId", "teamId name sport")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load students",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL TEAMS (FOR ADMIN MANAGEMENT)
// =====================================================
const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate("coachId", "userId name sport email phone gender teamName")
            .populate("students", "studentId name registerNumber department year approvalStatus")
            .populate("equipments.equipmentId", "equipmentId name category sport status")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: teams.length,
            teams
        });
    } catch (error) {
        console.error("Error fetching teams:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load teams list",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL EQUIPMENT (FOR ADMIN INVENTORY)
// =====================================================
const getAllEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: equipment.length,
            equipment
        });
    } catch (error) {
        console.error("Error fetching equipment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load equipment",
            error: error.message
        });
    }
};

// =====================================================
// ADD NEW EQUIPMENT
// =====================================================
const addEquipment = async (req, res) => {
    try {
        const {
            name,
            category,
            sport,
            totalQuantity,
            availableQuantity,
            damagedQuantity,
            status,
            equipmentId,
            targetTeamId,
            assignedQuantity
        } = req.body;

        const cleanName = (name || "").trim();
        const cleanCategory = (category || "General Gear").trim();
        const cleanSport = (sport || "General Athletics").trim();
        const totalQty = Math.max(0, Number(totalQuantity) || 1);
        const damagedQty = Math.max(0, Number(damagedQuantity) || 0);
        const availQty = availableQuantity !== undefined ? Math.max(0, Number(availableQuantity)) : Math.max(0, totalQty - damagedQty);
        const itemStatus = status || (availQty === 0 ? "out-of-stock" : "available");

        if (!cleanName) {
            return res.status(400).json({
                success: false,
                message: "Equipment name is required."
            });
        }

        // Generate unique Equipment ID if not provided
        let cleanEquipmentId = (equipmentId || "").trim().toUpperCase();
        if (!cleanEquipmentId) {
            const count = await Equipment.countDocuments();
            cleanEquipmentId = `EQ${String(count + 1).padStart(3, "0")}`;
        }

        const newEquipment = await Equipment.create({
            equipmentId: cleanEquipmentId,
            name: cleanName,
            category: cleanCategory,
            sport: cleanSport,
            totalQuantity: totalQty,
            availableQuantity: availQty,
            damagedQuantity: damagedQty,
            status: itemStatus
        });

        // If target team specified, assign requested quantity to the team
        if (targetTeamId && Number(assignedQuantity) > 0) {
            const team = await Team.findById(targetTeamId);
            if (team) {
                const assignQty = Math.min(availQty, Number(assignedQuantity));
                if (!team.equipments) team.equipments = [];
                team.equipments.push({
                    equipmentId: newEquipment._id,
                    name: newEquipment.name,
                    quantity: assignQty
                });
                await team.save();

                newEquipment.availableQuantity -= assignQty;
                if (newEquipment.availableQuantity === 0) newEquipment.status = "out-of-stock";
                await newEquipment.save();
            }
        }

        // Log Activity
        try {
            await Activity.create({
                type: "Equipment Added",
                message: `Admin added new equipment: ${cleanName} (${totalQty} units for ${cleanSport}).`,
                role: "admin"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(201).json({
            success: true,
            message: `Equipment '${cleanName}' (${cleanEquipmentId}) added successfully!`,
            equipment: newEquipment
        });
    } catch (error) {
        console.error("Error adding equipment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add equipment",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE EQUIPMENT
// =====================================================
const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, sport, totalQuantity, availableQuantity, damagedQuantity, status } = req.body;

        const equipment = await Equipment.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { equipmentId: id }
            ]
        });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment item not found."
            });
        }

        if (name) equipment.name = name.trim();
        if (category) equipment.category = category.trim();
        if (sport) equipment.sport = sport.trim();
        if (totalQuantity !== undefined) equipment.totalQuantity = Math.max(0, Number(totalQuantity));
        if (damagedQuantity !== undefined) equipment.damagedQuantity = Math.max(0, Number(damagedQuantity));
        if (availableQuantity !== undefined) {
            equipment.availableQuantity = Math.max(0, Number(availableQuantity));
        } else if (totalQuantity !== undefined || damagedQuantity !== undefined) {
            equipment.availableQuantity = Math.max(0, equipment.totalQuantity - equipment.damagedQuantity);
        }
        if (status) {
            equipment.status = status;
        } else {
            equipment.status = equipment.availableQuantity === 0 ? "out-of-stock" : "available";
        }

        await equipment.save();

        return res.status(200).json({
            success: true,
            message: `Equipment '${equipment.name}' updated successfully!`,
            equipment
        });
    } catch (error) {
        console.error("Error updating equipment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update equipment",
            error: error.message
        });
    }
};

// =====================================================
// DELETE EQUIPMENT
// =====================================================
const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { equipmentId: id }
            ]
        });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment item not found."
            });
        }

        await Equipment.findByIdAndDelete(equipment._id);

        // Remove from teams
        await Team.updateMany(
            {},
            { $pull: { equipments: { equipmentId: equipment._id } } }
        );

        return res.status(200).json({
            success: true,
            message: `Equipment '${equipment.name}' removed successfully.`
        });
    } catch (error) {
        console.error("Error deleting equipment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete equipment",
            error: error.message
        });
    }
};

// =====================================================
// ASSIGN EQUIPMENT TO TEAM
// =====================================================
const assignEquipmentToTeam = async (req, res) => {
    try {
        const { teamId, equipmentId, quantity } = req.body;
        const qty = Math.max(1, Number(quantity) || 1);

        const team = await Team.findOne({
            $or: [
                { _id: teamId && teamId.match(/^[0-9a-fA-F]{24}$/) ? teamId : null },
                { teamId: teamId }
            ]
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found."
            });
        }

        const equipment = await Equipment.findOne({
            $or: [
                { _id: equipmentId && equipmentId.match(/^[0-9a-fA-F]{24}$/) ? equipmentId : null },
                { equipmentId: equipmentId }
            ]
        });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });
        }

        if (equipment.availableQuantity < qty) {
            return res.status(400).json({
                success: false,
                message: `Only ${equipment.availableQuantity} units available of ${equipment.name}.`
            });
        }

        // Deduct from available quantity
        equipment.availableQuantity -= qty;
        if (equipment.availableQuantity === 0) equipment.status = "out-of-stock";
        await equipment.save();

        // Add or update team equipment entry
        if (!team.equipments) team.equipments = [];
        const existingIndex = team.equipments.findIndex(
            (e) => String(e.equipmentId) === String(equipment._id)
        );

        if (existingIndex >= 0) {
            team.equipments[existingIndex].quantity += qty;
        } else {
            team.equipments.push({
                equipmentId: equipment._id,
                name: equipment.name,
                quantity: qty
            });
        }

        await team.save();

        return res.status(200).json({
            success: true,
            message: `Assigned ${qty}x ${equipment.name} to '${team.name}' successfully!`,
            team,
            equipment
        });
    } catch (error) {
        console.error("Error assigning equipment to team:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to assign equipment to team",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE STUDENT APPROVAL STATUS
// =====================================================
const updateStudentApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!status || !["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status ('approved' or 'rejected') is required."
            });
        }

        const student = await Student.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { studentId: id }
            ]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        student.approvalStatus = status;
        await student.save();

        // Update corresponding User account status
        if (student.userId) {
            const userStatus = status === "approved" ? "active" : "inactive";
            await User.findByIdAndUpdate(student.userId, { status: userStatus });
        }

        // Log Activity
        try {
            await Activity.create({
                type: `Student ${status === "approved" ? "Approval" : "Rejection"}`,
                message: `Admin ${status} registration for ${student.name} (${student.registerNumber}).`,
                role: "admin"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Student ${student.name} registration has been ${status}.`,
            student
        });

    } catch (error) {
        console.error("Error updating student approval:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update student approval status",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL EQUIPMENT REQUESTS (FOR ADMIN)
// =====================================================
const getAllRequests = async (req, res) => {
    try {
        const requests = await EquipmentRequest.find()
            .populate("equipmentId", "name equipmentId category sport totalQuantity availableQuantity damagedQuantity status")
            .populate("studentId", "name studentId email registerNumber department year phone gender teamId")
            .populate("coachId", "name userId email phone sport teamName")
            .populate("returnedByCoach", "name userId email phone sport teamName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Error fetching admin requests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load requests",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE REQUEST STATUS (APPROVE / REJECT / RETURN)
// =====================================================
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, condition, damagedCount } = req.body;

        const validStatuses = ["pending", "approved", "rejected", "returned"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(", ")}`
            });
        }

        const request = await EquipmentRequest.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { requestId: id }
            ]
        })
            .populate("equipmentId")
            .populate("studentId")
            .populate("coachId")
            .populate("returnedByCoach");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Equipment request not found."
            });
        }

        const prevStatus = request.status;
        const equipment = request.equipmentId;

        // Status transition handling with inventory synchronization
        if (status === "approved" && prevStatus !== "approved") {
            if (equipment) {
                if (equipment.availableQuantity < request.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient inventory! Only ${equipment.availableQuantity} units available of '${equipment.name}'.`
                    });
                }
                equipment.availableQuantity -= request.quantity;
                if (equipment.availableQuantity === 0) equipment.status = "out-of-stock";
                await equipment.save();
            }
        } else if (status === "returned" && prevStatus !== "returned") {
            if (equipment) {
                const totalQty = request.quantity || 1;
                const returnCond = condition || request.returnCondition || "good";
                let damagedQty = 0;

                if (returnCond === "damaged") {
                    damagedQty = Math.max(1, Number(damagedCount) || totalQty);
                    damagedQty = Math.min(totalQty, damagedQty);
                } else if (returnCond === "partial_damaged") {
                    damagedQty = Math.max(1, Number(damagedCount) || 1);
                    damagedQty = Math.min(totalQty, damagedQty);
                }

                const goodQty = Math.max(0, totalQty - damagedQty);
                equipment.availableQuantity = (equipment.availableQuantity || 0) + goodQty;
                equipment.damagedQuantity = (equipment.damagedQuantity || 0) + damagedQty;

                if (equipment.availableQuantity > 0) {
                    equipment.status = "available";
                } else if (equipment.damagedQuantity === equipment.totalQuantity) {
                    equipment.status = "maintenance";
                }
                await equipment.save();

                request.returnCondition = returnCond;
                request.damagedQuantityReturned = damagedQty;
                request.goodQuantityReturned = goodQty;
                request.returnDate = new Date();
            }
        } else if (status === "rejected" && prevStatus === "approved") {
            if (equipment) {
                equipment.availableQuantity += request.quantity;
                if (equipment.availableQuantity > 0 && equipment.status === "out-of-stock") {
                    equipment.status = "available";
                }
                await equipment.save();
            }
        }

        request.status = status;
        if (remarks !== undefined) request.remarks = remarks.trim();
        await request.save();

        // Log Activity
        try {
            const requesterName = request.studentId?.name || request.coachId?.name || "Member";
            const equipName = equipment?.name || "Equipment";
            await Activity.create({
                type: `Equipment Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Admin marked request ${request.requestId} (${request.quantity}x ${equipName} for ${requesterName}) as '${status}'.`,
                role: "admin"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Request ${request.requestId} has been marked as ${status}.`,
            request
        });
    } catch (error) {
        console.error("Error updating request status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update request status",
            error: error.message
        });
    }
};

// =====================================================
// CREATE ADMIN ISSUE REQUEST (DIRECT ISSUE / LOG)
// =====================================================
const createAdminRequest = async (req, res) => {
    try {
        const { equipmentId, studentId, coachId, quantity, dueDate, remarks, status } = req.body;

        if (!equipmentId || !quantity || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Equipment item and a valid quantity (minimum 1) are required."
            });
        }

        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });
        }

        const qty = Number(quantity);
        const reqStatus = status || "approved";

        if (reqStatus === "approved" && equipment.availableQuantity < qty) {
            return res.status(400).json({
                success: false,
                message: `Only ${equipment.availableQuantity} units available of ${equipment.name}.`
            });
        }

        const count = await EquipmentRequest.countDocuments();
        const requestId = `REQ${String(count + 1).padStart(3, "0")}`;

        const newRequest = await EquipmentRequest.create({
            requestId,
            equipmentId: equipment._id,
            studentId: studentId || null,
            coachId: coachId || null,
            quantity: qty,
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            remarks: remarks || "Direct issue logged by Admin",
            status: reqStatus
        });

        if (reqStatus === "approved") {
            equipment.availableQuantity -= qty;
            if (equipment.availableQuantity === 0) equipment.status = "out-of-stock";
            await equipment.save();
        }

        return res.status(201).json({
            success: true,
            message: `Equipment request ${requestId} created successfully!`,
            request: newRequest
        });
    } catch (error) {
        console.error("Error creating request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create equipment request",
            error: error.message
        });
    }
};

// =====================================================
// DELETE REQUEST
// =====================================================
const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await EquipmentRequest.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { requestId: id }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        // If it was approved, restore quantity
        if (request.status === "approved") {
            const equipment = await Equipment.findById(request.equipmentId);
            if (equipment) {
                equipment.availableQuantity += request.quantity;
                if (equipment.availableQuantity > 0 && equipment.status === "out-of-stock") {
                    equipment.status = "available";
                }
                await equipment.save();
            }
        }

        await EquipmentRequest.findByIdAndDelete(request._id);

        return res.status(200).json({
            success: true,
            message: `Request ${request.requestId} deleted successfully.`
        });
    } catch (error) {
        console.error("Error deleting request:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete request",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL TOURNAMENTS (ADMIN)
// =====================================================
const getAllTournaments = async (req, res) => {
    try {
        const { sport, status, search } = req.query;
        let query = {};

        if (sport && sport !== "all") {
            query.sport = new RegExp(`^${sport}$`, "i");
        }

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { tournamentId: { $regex: search, $options: "i" } },
                { venue: { $regex: search, $options: "i" } },
                { sport: { $regex: search, $options: "i" } }
            ];
        }

        const tournaments = await Tournament.find(query).sort({ startDate: 1, createdAt: -1 });

        // Calculate summary metrics
        const total = await Tournament.countDocuments();
        const upcoming = await Tournament.countDocuments({ status: "upcoming" });
        const ongoing = await Tournament.countDocuments({ status: { $in: ["ongoing", "in-progress"] } });
        const completed = await Tournament.countDocuments({ status: "completed" });

        return res.status(200).json({
            success: true,
            count: tournaments.length,
            stats: {
                total,
                upcoming,
                ongoing,
                completed
            },
            tournaments
        });
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tournaments",
            error: error.message
        });
    }
};

// =====================================================
// CREATE TOURNAMENT (ADMIN)
// =====================================================
const createTournament = async (req, res) => {
    try {
        const {
            name,
            sport,
            startDate,
            endDate,
            venue,
            location,
            status,
            description,
            organizer,
            prizePool,
            maxTeams,
            registrationDeadline,
            eligibility
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tournament name is required."
            });
        }

        if (!sport || !sport.trim()) {
            return res.status(400).json({
                success: false,
                message: "Sport category is required."
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and End date are required."
            });
        }

        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid dates provided."
            });
        }

        if (parsedEndDate < parsedStartDate) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be earlier than start date."
            });
        }

        // Generate unique tournamentId
        const count = await Tournament.countDocuments();
        let tournamentId = `TRN${String(count + 1).padStart(3, "0")}`;
        let exists = await Tournament.findOne({ tournamentId });
        let offset = 1;
        while (exists) {
            tournamentId = `TRN${String(count + 1 + offset).padStart(3, "0")}`;
            exists = await Tournament.findOne({ tournamentId });
            offset++;
        }

        const tournament = await Tournament.create({
            tournamentId,
            name: name.trim(),
            sport: sport.trim(),
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            venue: (venue || "Main Sports Complex").trim(),
            location: (location || "BIT Campus").trim(),
            status: status || "upcoming",
            description: (description || "").trim(),
            organizer: (organizer || "BIT Sports Council").trim(),
            prizePool: (prizePool || "").trim(),
            maxTeams: Number(maxTeams) || 16,
            registeredTeamsCount: 0,
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
            eligibility: (eligibility || "Open to all enrolled students").trim()
        });

        // Log Activity
        try {
            await Activity.create({
                type: "Tournament",
                message: `Admin announced new tournament: '${tournament.name}' (${tournament.sport}).`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Tournament activity log failed:", logErr.message);
        }

        return res.status(201).json({
            success: true,
            message: `Tournament '${tournament.name}' created successfully!`,
            tournament
        });
    } catch (error) {
        console.error("Error creating tournament:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create tournament",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE TOURNAMENT (ADMIN)
// =====================================================
const updateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            sport,
            startDate,
            endDate,
            venue,
            location,
            status,
            description,
            organizer,
            prizePool,
            maxTeams,
            registeredTeamsCount,
            registrationDeadline,
            eligibility
        } = req.body;

        const tournament = await Tournament.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { tournamentId: id }
            ]
        });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: "Tournament not found."
            });
        }

        if (name) tournament.name = name.trim();
        if (sport) tournament.sport = sport.trim();
        if (startDate) tournament.startDate = new Date(startDate);
        if (endDate) tournament.endDate = new Date(endDate);
        if (venue) tournament.venue = venue.trim();
        if (location) tournament.location = location.trim();
        if (status) tournament.status = status;
        if (description !== undefined) tournament.description = description.trim();
        if (organizer) tournament.organizer = organizer.trim();
        if (prizePool !== undefined) tournament.prizePool = prizePool.trim();
        if (maxTeams !== undefined) tournament.maxTeams = Number(maxTeams) || tournament.maxTeams;
        if (registeredTeamsCount !== undefined) tournament.registeredTeamsCount = Number(registeredTeamsCount) || 0;
        if (registrationDeadline !== undefined) {
            tournament.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
        }
        if (eligibility) tournament.eligibility = eligibility.trim();

        await tournament.save();

        // Log Activity
        try {
            await Activity.create({
                type: "Tournament",
                message: `Tournament '${tournament.name}' was updated by admin.`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Tournament update activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Tournament '${tournament.name}' updated successfully.`,
            tournament
        });
    } catch (error) {
        console.error("Error updating tournament:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update tournament",
            error: error.message
        });
    }
};

// =====================================================
// DELETE TOURNAMENT (ADMIN)
// =====================================================
const deleteTournament = async (req, res) => {
    try {
        const { id } = req.params;

        const tournament = await Tournament.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { tournamentId: id }
            ]
        });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: "Tournament not found."
            });
        }

        const name = tournament.name;
        await Tournament.findByIdAndDelete(tournament._id);

        // Log Activity
        try {
            await Activity.create({
                type: "Tournament",
                message: `Tournament '${name}' was deleted by admin.`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Tournament delete activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Tournament '${name}' deleted successfully.`
        });
    } catch (error) {
        console.error("Error deleting tournament:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete tournament",
            error: error.message
        });
    }
};

// =====================================================
// SCHEDULE TIME HELPER FUNCTIONS & OVERLAP VALIDATION
// =====================================================
const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const trimmed = String(timeStr).trim();
    const isPM = /pm/i.test(trimmed);
    const isAM = /am/i.test(trimmed);
    const clean = trimmed.replace(/[^\d:]/g, "");
    const parts = clean.split(":");
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

const checkOverlapConflict = async ({
    venue,
    date,
    startMinutes,
    endMinutes,
    team1Id,
    team2Id,
    excludeScheduleId
}) => {
    if (!date || startMinutes === null || endMinutes === null) return null;

    const matchDate = new Date(date);
    const startOfDay = new Date(matchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(matchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ["cancelled", "postponed"] }
    };

    if (excludeScheduleId) {
        query._id = { $ne: excludeScheduleId };
    }

    const existingSchedules = await Schedule.find(query)
        .populate("tournamentId", "name tournamentId")
        .populate("team1Id", "name")
        .populate("team2Id", "name");

    for (const existing of existingSchedules) {
        const existStart = existing.startMinutes !== undefined && existing.startMinutes !== null
            ? existing.startMinutes
            : parseTimeToMinutes(existing.startTime || existing.time);
        const existEnd = existing.endMinutes !== undefined && existing.endMinutes !== null
            ? existing.endMinutes
            : (existStart !== null ? existStart + 120 : null);

        if (existStart === null || existEnd === null) continue;

        // Interval overlap: (newStart < existEnd && newEnd > existStart)
        const isTimeOverlap = startMinutes < existEnd && endMinutes > existStart;

        if (isTimeOverlap) {
            // Check Venue Overlap
            if (venue && existing.venue && venue.trim().toLowerCase() === existing.venue.trim().toLowerCase()) {
                const dateFormatted = matchDate.toLocaleDateString();
                return {
                    conflictType: "venue",
                    message: `Venue Conflict: '${venue}' is already booked on ${dateFormatted} from ${existing.startTime || "start"} to ${existing.endTime || "end"} for '${existing.title}' (${existing.tournamentName || "Tournament"}). Time and venue cannot overlap.`,
                    existing
                };
            }

            // Check Team 1 Overlap
            if (team1Id) {
                const existingT1 = String(existing.team1Id?._id || existing.team1Id);
                const existingT2 = String(existing.team2Id?._id || existing.team2Id);
                if (existingT1 === String(team1Id) || existingT2 === String(team1Id)) {
                    const dateFormatted = matchDate.toLocaleDateString();
                    return {
                        conflictType: "team",
                        message: `Team Conflict: Team 1 is already scheduled to play on ${dateFormatted} from ${existing.startTime || "start"} to ${existing.endTime || "end"} in '${existing.title}'. Teams cannot play overlapping matches.`,
                        existing
                    };
                }
            }

            // Check Team 2 Overlap
            if (team2Id) {
                const existingT1 = String(existing.team1Id?._id || existing.team1Id);
                const existingT2 = String(existing.team2Id?._id || existing.team2Id);
                if (existingT1 === String(team2Id) || existingT2 === String(team2Id)) {
                    const dateFormatted = matchDate.toLocaleDateString();
                    return {
                        conflictType: "team",
                        message: `Team Conflict: Team 2 is already scheduled to play on ${dateFormatted} from ${existing.startTime || "start"} to ${existing.endTime || "end"} in '${existing.title}'.`,
                        existing
                    };
                }
            }
        }
    }

    return null;
};

// =====================================================
// CHECK VENUE / SCHEDULE AVAILABILITY (API)
// =====================================================
const checkScheduleAvailability = async (req, res) => {
    try {
        const { venue, date, startTime, endTime, team1Id, team2Id, excludeId } = req.query;

        if (!venue || !date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Venue, date, start time, and end time are required."
            });
        }

        const startMinutes = parseTimeToMinutes(startTime);
        const endMinutes = parseTimeToMinutes(endTime);

        if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
            return res.status(400).json({
                success: false,
                message: "End time must be later than start time."
            });
        }

        const conflict = await checkOverlapConflict({
            venue,
            date,
            startMinutes,
            endMinutes,
            team1Id,
            team2Id,
            excludeScheduleId: excludeId
        });

        if (conflict) {
            return res.status(200).json({
                success: true,
                available: false,
                conflictType: conflict.conflictType,
                message: conflict.message
            });
        }

        return res.status(200).json({
            success: true,
            available: true,
            message: `Venue '${venue}' is available on this date & time slot.`
        });
    } catch (error) {
        console.error("Availability check error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to check availability",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL SCHEDULES (ADMIN)
// =====================================================
const getAllSchedules = async (req, res) => {
    try {
        const { tournamentId, sport, status, date, venue, search } = req.query;
        let query = {};

        if (tournamentId && tournamentId !== "all") {
            query.tournamentId = tournamentId;
        }

        if (sport && sport !== "all") {
            query.sport = new RegExp(`^${sport}$`, "i");
        }

        if (status && status !== "all") {
            query.status = status;
        }

        if (venue && venue !== "all") {
            query.venue = new RegExp(`^${venue}$`, "i");
        }

        if (date) {
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(searchDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { scheduleId: { $regex: search, $options: "i" } },
                { tournamentName: { $regex: search, $options: "i" } },
                { team1Name: { $regex: search, $options: "i" } },
                { team2Name: { $regex: search, $options: "i" } },
                { venue: { $regex: search, $options: "i" } }
            ];
        }

        const schedules = await Schedule.find(query)
            .populate("tournamentId", "name tournamentId sport startDate endDate status")
            .populate("team1Id", "name sport coachId students")
            .populate("team2Id", "name sport coachId students")
            .populate("coachId", "name coachId email")
            .populate("winnerTeamId", "name")
            .sort({ date: 1, startMinutes: 1, createdAt: -1 });

        // Calculate summary metrics
        const total = await Schedule.countDocuments();
        const upcoming = await Schedule.countDocuments({ status: { $in: ["scheduled", "upcoming"] } });
        const live = await Schedule.countDocuments({ status: { $in: ["in-progress", "ongoing"] } });
        const completed = await Schedule.countDocuments({ status: "completed" });

        return res.status(200).json({
            success: true,
            count: schedules.length,
            stats: {
                total,
                upcoming,
                live,
                completed
            },
            schedules
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch schedules",
            error: error.message
        });
    }
};

// =====================================================
// CREATE SCHEDULE (ADMIN) - WITH OVERLAP PREVENTION
// =====================================================
const createSchedule = async (req, res) => {
    try {
        const {
            tournamentId,
            title,
            sport,
            round,
            team1Id,
            team1Name,
            team2Id,
            team2Name,
            venue,
            date,
            startTime,
            endTime,
            referee,
            remarks
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Match title / fixture name is required."
            });
        }

        if (!venue || !venue.trim()) {
            return res.status(400).json({
                success: false,
                message: "Venue is required."
            });
        }

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Match date is required."
            });
        }

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Start time and End time are required."
            });
        }

        const startMinutes = parseTimeToMinutes(startTime);
        const endMinutes = parseTimeToMinutes(endTime);

        if (startMinutes === null || endMinutes === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format provided (e.g. use 10:00, 14:30)."
            });
        }

        if (endMinutes <= startMinutes) {
            return res.status(400).json({
                success: false,
                message: "End time must be later than start time."
            });
        }

        // ==========================================
        // OVERLAP PREVENTION CHECK (VENUE & TEAMS)
        // ==========================================
        const conflict = await checkOverlapConflict({
            venue: venue.trim(),
            date,
            startMinutes,
            endMinutes,
            team1Id,
            team2Id
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                conflictType: conflict.conflictType,
                message: conflict.message
            });
        }

        // Resolve Tournament details
        let tournament = null;
        if (tournamentId) {
            tournament = await Tournament.findById(tournamentId);
        }

        // Resolve Teams & Coaches
        let resolvedTeam1Name = team1Name || "";
        let coachId = null;
        let coachUserId = "";

        if (team1Id) {
            const t1 = await Team.findById(team1Id).populate("coachId");
            if (t1) {
                resolvedTeam1Name = t1.name;
                coachId = t1.coachId?._id || t1.coachId || null;
                coachUserId = t1.coachUserId || "";
            }
        }

        let resolvedTeam2Name = team2Name || "";
        let coach2Id = null;
        if (team2Id) {
            const t2 = await Team.findById(team2Id);
            if (t2) {
                resolvedTeam2Name = t2.name;
                coach2Id = t2.coachId || null;
            }
        }

        // Generate scheduleId
        const count = await Schedule.countDocuments();
        let scheduleId = `SCH${String(count + 1).padStart(3, "0")}`;
        let exists = await Schedule.findOne({ scheduleId });
        let offset = 1;
        while (exists) {
            scheduleId = `SCH${String(count + 1 + offset).padStart(3, "0")}`;
            exists = await Schedule.findOne({ scheduleId });
            offset++;
        }

        const newSchedule = await Schedule.create({
            scheduleId,
            tournamentId: tournament?._id || null,
            tournamentName: tournament?.name || (tournamentId ? "Tournament" : ""),
            title: title.trim(),
            sport: (sport || tournament?.sport || "General").trim(),
            round: (round || "League Match").trim(),
            team1Id: team1Id || null,
            team1Name: resolvedTeam1Name,
            team2Id: team2Id || null,
            team2Name: resolvedTeam2Name,
            coachId,
            coachUserId,
            coach2Id,
            venue: venue.trim(),
            date: new Date(date),
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            startMinutes,
            endMinutes,
            status: "scheduled",
            referee: (referee || "").trim(),
            remarks: (remarks || "").trim(),
            // Legacy aliases
            opponent: resolvedTeam2Name,
            opponentTeam: resolvedTeam2Name,
            time: `${startTime.trim()} - ${endTime.trim()}`,
            teamId: team1Id || null
        });

        // Log Activity
        try {
            await Activity.create({
                type: "Match",
                message: `Match scheduled: '${newSchedule.title}' on ${new Date(date).toLocaleDateString()} at ${newSchedule.venue} (${startTime} - ${endTime}).`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Schedule activity log failed:", logErr.message);
        }

        return res.status(201).json({
            success: true,
            message: `Match '${newSchedule.title}' scheduled successfully without conflicts!`,
            schedule: newSchedule
        });
    } catch (error) {
        console.error("Error creating schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to schedule match",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE SCHEDULE (ADMIN) - WITH OVERLAP PREVENTION
// =====================================================
const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            tournamentId,
            title,
            sport,
            round,
            team1Id,
            team1Name,
            team2Id,
            team2Name,
            venue,
            date,
            startTime,
            endTime,
            status,
            score,
            winnerTeamId,
            winnerName,
            referee,
            remarks
        } = req.body;

        const schedule = await Schedule.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { scheduleId: id }
            ]
        });

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule fixture not found."
            });
        }

        const finalVenue = (venue || schedule.venue).trim();
        const finalDate = date ? new Date(date) : schedule.date;
        const finalStartTime = startTime ? startTime.trim() : schedule.startTime;
        const finalEndTime = endTime ? endTime.trim() : schedule.endTime;
        const finalStartMinutes = parseTimeToMinutes(finalStartTime);
        const finalEndMinutes = parseTimeToMinutes(finalEndTime);
        const finalTeam1Id = team1Id !== undefined ? team1Id : schedule.team1Id;
        const finalTeam2Id = team2Id !== undefined ? team2Id : schedule.team2Id;

        if (finalEndMinutes <= finalStartMinutes) {
            return res.status(400).json({
                success: false,
                message: "End time must be later than start time."
            });
        }

        // ==========================================
        // OVERLAP PREVENTION (EXCLUDING CURRENT MATCH)
        // ==========================================
        if (status !== "cancelled") {
            const conflict = await checkOverlapConflict({
                venue: finalVenue,
                date: finalDate,
                startMinutes: finalStartMinutes,
                endMinutes: finalEndMinutes,
                team1Id: finalTeam1Id,
                team2Id: finalTeam2Id,
                excludeScheduleId: schedule._id
            });

            if (conflict) {
                return res.status(409).json({
                    success: false,
                    conflictType: conflict.conflictType,
                    message: conflict.message
                });
            }
        }

        if (title) schedule.title = title.trim();
        if (sport) schedule.sport = sport.trim();
        if (round) schedule.round = round.trim();
        if (tournamentId !== undefined) schedule.tournamentId = tournamentId || null;
        if (team1Id !== undefined) schedule.team1Id = team1Id || null;
        if (team1Name !== undefined) schedule.team1Name = team1Name.trim();
        if (team2Id !== undefined) schedule.team2Id = team2Id || null;
        if (team2Name !== undefined) schedule.team2Name = team2Name.trim();
        if (venue) schedule.venue = finalVenue;
        if (date) schedule.date = finalDate;
        if (startTime) schedule.startTime = finalStartTime;
        if (endTime) schedule.endTime = finalEndTime;
        schedule.startMinutes = finalStartMinutes;
        schedule.endMinutes = finalEndMinutes;
        if (status) schedule.status = status;
        if (score !== undefined) schedule.score = score.trim();
        if (winnerTeamId !== undefined) schedule.winnerTeamId = winnerTeamId || null;
        if (winnerName !== undefined) schedule.winnerName = winnerName.trim();
        if (referee !== undefined) schedule.referee = referee.trim();
        if (remarks !== undefined) schedule.remarks = remarks.trim();

        // Legacy updates
        schedule.opponent = schedule.team2Name;
        schedule.opponentTeam = schedule.team2Name;
        schedule.time = `${schedule.startTime} - ${schedule.endTime}`;

        await schedule.save();

        // Log Activity
        try {
            await Activity.create({
                type: "Match",
                message: `Match schedule updated: '${schedule.title}' (${schedule.status}) on ${new Date(schedule.date).toLocaleDateString()}.`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Schedule update activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Schedule for '${schedule.title}' updated successfully.`,
            schedule
        });
    } catch (error) {
        console.error("Error updating schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update schedule",
            error: error.message
        });
    }
};

// =====================================================
// DELETE SCHEDULE (ADMIN)
// =====================================================
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { scheduleId: id }
            ]
        });

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found."
            });
        }

        const title = schedule.title;
        await Schedule.findByIdAndDelete(schedule._id);

        // Log Activity
        try {
            await Activity.create({
                type: "Match",
                message: `Match schedule '${title}' was deleted by admin.`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Schedule delete activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Schedule '${title}' deleted successfully.`
        });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete schedule",
            error: error.message
        });
    }
};

// =====================================================
// GET ALL VENUES (ADMIN)
// =====================================================
const getAllVenues = async (req, res) => {
    try {
        const { sport, status, search } = req.query;
        let query = {};

        if (sport && sport !== "all" && sport !== "All Sports") {
            query.sport = new RegExp(`^${sport}$`, "i");
        }

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { venueId: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { sport: { $regex: search, $options: "i" } }
            ];
        }

        let total = await Venue.countDocuments();
        if (total === 0) {
            const defaultVenues = [
                { venueId: "VEN001", name: "Main Sports Complex", location: "North Campus Sports Wing", capacity: 2000, sport: "Multi-Sport / General", status: "available" },
                { venueId: "VEN002", name: "Cricket Ground A", location: "Main Pavilion Ground", capacity: 1500, sport: "Cricket", status: "available" },
                { venueId: "VEN003", name: "Cricket Ground B", location: "East Campus Field", capacity: 500, sport: "Cricket", status: "available" },
                { venueId: "VEN004", name: "Football Arena", location: "Athletics Complex", capacity: 1200, sport: "Football", status: "available" },
                { venueId: "VEN005", name: "Indoor Badminton Hall - Court 1", location: "Indoor Stadium Block B", capacity: 300, sport: "Badminton", status: "available" },
                { venueId: "VEN006", name: "Indoor Badminton Hall - Court 2", location: "Indoor Stadium Block B", capacity: 300, sport: "Badminton", status: "available" },
                { venueId: "VEN007", name: "Basketball Court 1", location: "Sports Quad Level 1", capacity: 400, sport: "Basketball", status: "available" },
                { venueId: "VEN008", name: "Tennis Complex Court 1", location: "South Tennis Arena", capacity: 250, sport: "Tennis", status: "available" },
                { venueId: "VEN009", name: "Volleyball Court A", location: "West Sports Ground", capacity: 300, sport: "Volleyball", status: "available" },
                { venueId: "VEN010", name: "Athletics Synthetic Track", location: "Main Stadium", capacity: 2500, sport: "Athletics", status: "available" }
            ];
            await Venue.insertMany(defaultVenues);
            total = defaultVenues.length;
        }

        const venues = await Venue.find(query).sort({ name: 1 });

        const available = await Venue.countDocuments({ status: "available" });
        const occupied = await Venue.countDocuments({ status: "occupied" });
        const maintenance = await Venue.countDocuments({ status: "maintenance" });

        return res.status(200).json({
            success: true,
            count: venues.length,
            stats: {
                total,
                available,
                occupied,
                maintenance
            },
            venues
        });
    } catch (error) {
        console.error("Error fetching venues:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch venues",
            error: error.message
        });
    }
};

// =====================================================
// CREATE VENUE (ADMIN)
// =====================================================
const createVenue = async (req, res) => {
    try {
        const { name, location, capacity, sport, status } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Venue name is required."
            });
        }

        // Check if venue with same name already exists
        const existingVenue = await Venue.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
        });

        if (existingVenue) {
            return res.status(400).json({
                success: false,
                message: `Venue with name '${name.trim()}' already exists.`
            });
        }

        // Generate venueId
        const count = await Venue.countDocuments();
        let venueId = `VEN${String(count + 1).padStart(3, "0")}`;
        let exists = await Venue.findOne({ venueId });
        let offset = 1;
        while (exists) {
            venueId = `VEN${String(count + 1 + offset).padStart(3, "0")}`;
            exists = await Venue.findOne({ venueId });
            offset++;
        }

        const newVenue = await Venue.create({
            venueId,
            name: name.trim(),
            location: (location || "").trim(),
            capacity: Number(capacity) || 0,
            sport: (sport || "General").trim(),
            status: status || "available"
        });

        // Log Activity
        try {
            await Activity.create({
                type: "Venue Added",
                message: `New sports venue '${newVenue.name}' (${newVenue.venueId}) added.`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Venue activity log failed:", logErr.message);
        }

        return res.status(201).json({
            success: true,
            message: `Venue '${newVenue.name}' created successfully!`,
            venue: newVenue
        });
    } catch (error) {
        console.error("Error creating venue:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create venue",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE VENUE (ADMIN)
// =====================================================
const updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, capacity, sport, status } = req.body;

        const venue = await Venue.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { venueId: id }
            ]
        });

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: "Venue not found."
            });
        }

        if (name && name.trim() !== venue.name) {
            const duplicate = await Venue.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
                _id: { $ne: venue._id }
            });
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: `Another venue with name '${name.trim()}' already exists.`
                });
            }
            venue.name = name.trim();
        }

        if (location !== undefined) venue.location = location.trim();
        if (capacity !== undefined) venue.capacity = Number(capacity) || 0;
        if (sport !== undefined) venue.sport = sport.trim();
        if (status !== undefined) venue.status = status;

        await venue.save();

        // Log Activity
        try {
            await Activity.create({
                type: "Venue Updated",
                message: `Venue '${venue.name}' (${venue.status}) details were updated.`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Venue update activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Venue '${venue.name}' updated successfully!`,
            venue
        });
    } catch (error) {
        console.error("Error updating venue:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update venue",
            error: error.message
        });
    }
};

// =====================================================
// DELETE VENUE (ADMIN)
// =====================================================
const deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;

        const venue = await Venue.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { venueId: id }
            ]
        });

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: "Venue not found."
            });
        }

        const venueName = venue.name;
        await Venue.findByIdAndDelete(venue._id);

        // Log Activity
        try {
            await Activity.create({
                type: "Venue Deleted",
                message: `Venue '${venueName}' was removed from the system.`,
                role: "admin",
                userId: req.user?.userId || "admin"
            });
        } catch (logErr) {
            console.warn("Venue delete activity log failed:", logErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Venue '${venueName}' deleted successfully.`
        });
    } catch (error) {
        console.error("Error deleting venue:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete venue",
            error: error.message
        });
    }
};

// =====================================================
// GET RECENT ACTIVITIES (REAL-TIME STREAM / POLL)
// =====================================================
const getRecentActivities = async (req, res) => {
    try {
        const activities = await Activity.find().sort({ createdAt: -1 }).limit(20);
        const formattedActivities = activities.map((act) => {
            const rawAction = act.action || act.message || act.type || "System Activity";
            const rawUser = act.user || (act.role ? act.role.toUpperCase() : "ADMIN");
            
            let status = act.status || "COMPLETED";
            const typeLower = (act.type || "").toLowerCase();
            const actionLower = rawAction.toLowerCase();
            if (actionLower.includes("reject") || typeLower.includes("reject")) {
                status = "REJECTED";
            } else if (actionLower.includes("pending") || typeLower.includes("pending")) {
                status = "PENDING";
            } else if (actionLower.includes("approved") || typeLower.includes("approve")) {
                status = "APPROVED";
            } else if (actionLower.includes("update") || typeLower.includes("update") || actionLower.includes("edit")) {
                status = "UPDATED";
            } else if (actionLower.includes("delete") || actionLower.includes("remove")) {
                status = "DELETED";
            } else if (actionLower.includes("add") || actionLower.includes("created") || actionLower.includes("registered") || actionLower.includes("assigned")) {
                status = "CREATED";
            }

            return {
                _id: act._id,
                action: rawAction,
                message: act.message || rawAction,
                user: rawUser,
                role: act.role || "admin",
                status: status,
                type: (actionLower.includes("reject") || typeLower.includes("reject") || actionLower.includes("delete"))
                    ? "danger"
                    : (actionLower.includes("pending") || typeLower.includes("pending"))
                    ? "warning"
                    : "success",
                createdAt: act.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            activities: formattedActivities
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard,
    getRecentActivities,
    addCoach,
    getAllCoaches,
    deleteCoach,
    getAllStudents,
    getAllTeams,
    getAllEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    assignEquipmentToTeam,
    updateStudentApproval,
    getAllRequests,
    updateRequestStatus,
    createAdminRequest,
    deleteRequest,
    getAllTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    getAllSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    checkScheduleAvailability,
    checkOverlapConflict,
    parseTimeToMinutes,
    getAllVenues,
    createVenue,
    updateVenue,
    deleteVenue
};