const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getStudentDashboard,
    getAvailableEquipment,
    submitEquipmentRequest,
    getStudentTournaments,
    getStudentSchedules,
    getStudentTeam,
    getStudentRequests,
    getStudentProfile
} = require("../controllers/studentController");

// All student routes require student authentication
router.use(protect);
router.use(authorize("student"));

router.get("/dashboard", getStudentDashboard);
router.get("/team", getStudentTeam);
router.get("/equipment", getAvailableEquipment);
router.post("/equipment-request", submitEquipmentRequest);
router.get("/requests", getStudentRequests);
router.get("/tournaments", getStudentTournaments);
router.get("/schedules", getStudentSchedules);
router.get("/profile", getStudentProfile);

module.exports = router;
