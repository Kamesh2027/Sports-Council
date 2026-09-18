const express = require("express");
const router = express.Router();

const {
    getCoachDashboard,
    getCoachStudents,
    getCoachTeam,
    getCoachEquipment,
    getCoachRequests,
    returnEquipmentByCoach,
    returnEquipmentDirect,
    getCoachTournaments,
    getCoachSchedules
} = require("../controllers/coachController");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");


router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachDashboard
);

router.get(
    "/students",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachStudents
);

router.get(
    "/team",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachTeam
);

router.get(
    "/equipment",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachEquipment
);

router.post(
    "/equipment/return",
    authMiddleware,
    roleMiddleware("coach"),
    returnEquipmentDirect
);

router.post(
    "/return-equipment",
    authMiddleware,
    roleMiddleware("coach"),
    returnEquipmentDirect
);

router.get(
    "/requests",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachRequests
);

router.post(
    "/requests/:id/return",
    authMiddleware,
    roleMiddleware("coach"),
    returnEquipmentByCoach
);

router.put(
    "/requests/:id/return",
    authMiddleware,
    roleMiddleware("coach"),
    returnEquipmentByCoach
);

router.get(
    "/tournaments",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachTournaments
);

router.get(
    "/schedules",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachSchedules
);


module.exports = router;