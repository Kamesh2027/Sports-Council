const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getStudentDashboard,
    getAvailableEquipment,
    submitEquipmentRequest
} = require("../controllers/studentController");

// All student routes require student authentication
router.use(protect);
router.use(authorize("student"));

router.get("/dashboard", getStudentDashboard);
router.get("/equipment", getAvailableEquipment);
router.post("/equipment-request", submitEquipmentRequest);

module.exports = router;
