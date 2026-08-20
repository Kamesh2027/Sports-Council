const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

const User = require("../src/models/User");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

const createAdmin = async () => {
    try {
        console.log(
            "MongoDB URI:",
            process.env.MONGODB_URI ? "Found" : "Not Found"
        );

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected");

        const existingAdmin = await User.findOne({
            email: "admin@sports.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            10
        );

        const admin = new User({
            userId: "ADMIN001",
            name: "Sports Council Admin",
            email: "admin@sports.com",
            password: hashedPassword,
            role: "admin",
            status: "active"
        });

        await admin.save();

        console.log("Admin created successfully");
        console.log("Email: admin@sports.com");
        console.log("Password: Admin@123");

        await mongoose.connection.close();

    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

createAdmin();