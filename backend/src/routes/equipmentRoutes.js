const express = require("express");
const router = express.Router();
const {
    getAllEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    assignEquipmentToTeam
} = require("../controllers/adminController");

router.get("/", getAllEquipment);
router.post("/", addEquipment);
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);
router.post("/assign-team", assignEquipmentToTeam);

module.exports = router;
