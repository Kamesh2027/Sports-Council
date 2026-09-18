const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

const User = require("../src/models/User");
const Coach = require("../src/models/Coach");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});


const createCoach = async () => {

    try {

        console.log(
            "MongoDB URI:",
            process.env.MONGODB_URI
                ? "Found"
                : "Not Found"
        );


        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "MongoDB Connected"
        );


        // =====================================================
        // USER ID
        // =====================================================

        const userId = "COACH010";

        const email = "coach2@sports.com";


        // =====================================================
        // CHECK USER
        // =====================================================

        let user = await User.findOne({
            email: email
        });


        if (user) {

            console.log(
                "User already exists"
            );

        } else {

            const hashedPassword =
                await bcrypt.hash(
                    "Coach@123",
                    10
                );


            user = new User({

                userId: userId,

                name: "Sports Coach",

                email: email,

                password: hashedPassword,

                role: "coach",

                status: "active"

            });


            await user.save();

            console.log(
                "Coach user created"
            );

        }


        // =====================================================
        // CHECK COACH PROFILE
        // =====================================================

        let coach = await Coach.findOne({
            userId: userId
        });


        if (coach) {

            console.log(
                "Coach profile already exists"
            );

        } else {

            coach = new Coach({

                userId: userId,

                name: "Sports Coach",

                email: email,

                status: "active"

            });


            await coach.save();

            console.log(
                "Coach profile created"
            );

        }


        // =====================================================
        // LOGIN DETAILS
        // =====================================================

        console.log("");
        console.log("==============================");
        console.log("COACH LOGIN");
        console.log("==============================");
        console.log(
            "Email:",
            email
        );
        console.log(
            "Password:",
            "Coach@123"
        );
        console.log(
            "User ID:",
            userId
        );
        console.log("==============================");


        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {

        console.error(
            "Error:",
            error
        );

        process.exit(1);

    }

};


createCoach();