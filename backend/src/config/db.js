const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        mongoose.connection.on("disconnected", () => {
            console.warn("[MongoDB] Connection lost. Attempting to reconnect...");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("[MongoDB] Reconnected successfully to database!");
        });

        mongoose.connection.on("error", (err) => {
            console.error("[MongoDB] Connection error:", err.message);
        });

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4 // Force IPv4 to prevent IPv6 DNS timeout issues on Windows
        });

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        // Retry connection in background instead of immediately exiting
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;