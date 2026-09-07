const mongoose = require("mongoose");
require("dotenv").config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sports-council");
        console.log("Connected to MongoDB Atlas");

        const Coach = require("../models/Coach");
        const Team = require("../models/Team");
        const Student = require("../models/Student");

        const coaches = await Coach.find();
        for (const coach of coaches) {
            const fallbackTeamName = coach.teamName || (coach.sport ? `${coach.sport} Team` : "General Athletics Team");

            let team = await Team.findOne({
                $or: [
                    { coachId: coach._id },
                    { name: fallbackTeamName }
                ]
            });

            if (!team) {
                const teamCount = await Team.countDocuments();
                const teamId = `TEAM${String(teamCount + 1).padStart(3, "0")}`;
                team = await Team.create({
                    teamId,
                    name: fallbackTeamName,
                    sport: coach.sport || "Athletics",
                    coachId: coach._id,
                    students: []
                });
            } else {
                team.coachId = coach._id;
                team.sport = coach.sport || team.sport;
                if (!team.name || team.name.trim() === "") team.name = fallbackTeamName;
                await team.save();
            }

            coach.teamName = team.name;
            coach.teamId = team._id;
            await coach.save();

            // Link students of this coach
            const students = await Student.find({
                $or: [
                    { coachId: coach._id },
                    { coachUserId: coach.userId }
                ]
            });

            for (const student of students) {
                student.coachId = coach._id;
                student.coachUserId = coach.userId;
                student.teamId = team._id;
                await student.save();

                if (!team.students.includes(student._id)) {
                    team.students.push(student._id);
                }
            }
            await team.save();

            console.log(`Synced Coach: ${coach.name} -> Team: ${team.name} (${team.students.length} athletes)`);
        }

        await mongoose.disconnect();
        console.log("Team and Student sync complete!");
    } catch (err) {
        console.error("Migration error:", err);
    }
})();
