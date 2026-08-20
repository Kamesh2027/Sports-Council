const express = require("express");

const router = express.Router();

const { getDashboard } = require("../controllers/adminController");

// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/dashboard",
    // authMiddleware,
    // roleMiddleware("admin"),
    getDashboard
);

module.exports = router;