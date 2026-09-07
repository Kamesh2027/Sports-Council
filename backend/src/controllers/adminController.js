const Coach = require("../models/Coach");
const Student = require("../models/Student");
const Team = require("../models/Team");
const Equipment = require("../models/Equipment");
const EquipmentRequest = require("../models/EquipmentRequest");
const Tournament = require("../models/Tournament");
const Venue = require("../models/Venue");
const Activity = require("../models/Activity");
const User = require("../models/User");
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
            Activity.find().sort({ createdAt: -1 }).limit(10),
            Tournament.find({
                status: { $in: ["upcoming", "ongoing"] }
            }).sort({ startDate: 1 }).limit(5),
            Venue.find().sort({ name: 1 })
        ]);

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
            activities,
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
            .populate("equipmentId", "name equipmentId category sport totalQuantity availableQuantity status")
            .populate("studentId", "name studentId email registerNumber department year phone gender teamId")
            .populate("coachId", "name userId email phone sport teamName")
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
        const { status, remarks } = req.body;

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
            .populate("coachId");

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
        } else if ((status === "returned" || status === "rejected") && prevStatus === "approved") {
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

module.exports = {
    getDashboard,
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
    deleteRequest
};