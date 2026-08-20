const Activity = require("../models/Activity");

const createActivity = async ({
    action,
    user = "System",
    status = "COMPLETED",
    type = "success"
}) => {
    try {
        await Activity.create({
            action,
            user,
            status,
            type
        });
    } catch (error) {
        console.error("Activity logging failed:", error.message);
    }
};

module.exports = createActivity;