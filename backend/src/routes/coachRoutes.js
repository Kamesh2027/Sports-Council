const express = require("express");

const router = express.Router();

const {
    getCoachDashboard,
    getCoachStudents,
    getCoachTeam,
    getCoachEquipment,
    getCoachRequests,
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

router.get(
    "/requests",
    authMiddleware,
    roleMiddleware("coach"),
    getCoachRequests
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