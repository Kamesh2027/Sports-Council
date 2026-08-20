const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.use("/api/coaches", require("./routes/coachRoutes"));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});