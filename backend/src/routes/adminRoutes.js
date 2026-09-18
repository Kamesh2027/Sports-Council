const express = require("express");
const router = express.Router();

const {
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
    getAllVenues,
    createVenue,
    updateVenue,
    deleteVenue
} = require("../controllers/adminController");

// Admin routes
router.get("/dashboard", getDashboard);

// Coach Management
router.get("/coaches", getAllCoaches);
router.post("/coaches", addCoach);
router.delete("/coaches/:id", deleteCoach);

// Team Management
router.get("/teams", getAllTeams);

// Equipment Management
router.get("/equipment", getAllEquipment);
router.post("/equipment", addEquipment);
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);
router.post("/equipment/assign-team", assignEquipmentToTeam);

// Student Management
router.get("/students", getAllStudents);
router.put("/students/:id/status", updateStudentApproval);

// Equipment Requests Management
router.get("/requests", getAllRequests);
router.post("/requests", createAdminRequest);
router.put("/requests/:id/status", updateRequestStatus);
router.delete("/requests/:id", deleteRequest);

// Tournament Management
router.get("/tournaments", getAllTournaments);
router.post("/tournaments", createTournament);
router.put("/tournaments/:id", updateTournament);
router.delete("/tournaments/:id", deleteTournament);

// Schedule Management & Conflict Checking
router.get("/schedules", getAllSchedules);
router.get("/schedules/check-availability", checkScheduleAvailability);
router.post("/schedules", createSchedule);
router.put("/schedules/:id", updateSchedule);
router.delete("/schedules/:id", deleteSchedule);

// Venue Management
router.get("/venues", getAllVenues);
router.post("/venues", createVenue);
router.put("/venues/:id", updateVenue);
router.delete("/venues/:id", deleteVenue);

module.exports = router;