const Coach = require("../models/Coach");

exports.createCoach = async (req, res) => {
  try {
    const coach = new Coach(req.body);
    await coach.save();
    res.json({ message: "Coach created successfully", coach });
  } catch (err) {
    res.status(500).json({ message: "Error creating coach" });
  }
};
