const User = require("../models/User");
const Student = require("../models/Student");
const Coach = require("../models/Coach");
const Team = require("../models/Team");
const Activity = require("../models/Activity");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmailOtp } = require("../utils/emailService");

// Email OTP storage
// Format: { [email]: { otp: string, expiresAt: number, verified: boolean } }
const emailOtpStore = {};

// Clean up expired email OTPs periodically
setInterval(() => {
    const now = Date.now();
    for (const email in emailOtpStore) {
        if (emailOtpStore[email].expiresAt < now) {
            delete emailOtpStore[email];
        }
    }
}, 60000);

// =====================================================
// SEND EMAIL OTP
// =====================================================
const sendEmailVerificationOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Check if email already registered
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email address already exists. Please sign in."
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 5 minutes expiry
        emailOtpStore[cleanEmail] = {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            verified: false
        };

        // Dispatch Email
        const emailResult = await sendEmailOtp(cleanEmail, otp);

        const responsePayload = {
            success: true,
            message: emailResult.provider !== "console"
                ? `Verification code has been sent to ${cleanEmail}.`
                : `Verification code generated for ${cleanEmail}.`
        };

        if (emailResult.provider === "console") {
            responsePayload.devOtp = otp;
        }

        return res.status(200).json(responsePayload);
    } catch (error) {
        console.error("Error in sendEmailVerificationOtp:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send email verification OTP",
            error: error.message
        });
    }
};

// =====================================================
// VERIFY EMAIL OTP
// =====================================================
const verifyEmailVerificationOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email address and verification code are required"
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const record = emailOtpStore[cleanEmail];

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "No email verification request found. Please click 'Send Code'."
            });
        }

        if (Date.now() > record.expiresAt) {
            delete emailOtpStore[cleanEmail];
            return res.status(400).json({
                success: false,
                message: "Email verification code has expired. Please request a new code."
            });
        }

        if (record.otp !== otp.trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid email verification code. Please check your inbox and try again."
            });
        }

        // Mark as verified
        record.verified = true;

        return res.status(200).json({
            success: true,
            message: "Email address verified successfully!"
        });
    } catch (error) {
        console.error("Error in verifyEmailVerificationOtp:", error);
        return res.status(500).json({
            success: false,
            message: "Email verification failed",
            error: error.message
        });
    }
};

// =====================================================
// GET AVAILABLE COACHES
// =====================================================
const getAvailableCoaches = async (req, res) => {
    try {
        const coaches = await Coach.find({}, "userId name sport email teamName").sort({ name: 1 });
        return res.status(200).json({
            success: true,
            coaches
        });
    } catch (error) {
        console.error("Error fetching coaches:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load coaches",
            error: error.message
        });
    }
};

// =====================================================
// REGISTER STUDENT
// =====================================================
const registerStudent = async (req, res) => {
    try {
        const {
            name,
            rollNumber,
            registerNumber,
            email,
            phone,
            emailOtp,
            coachUserId,
            password,
            department,
            year
        } = req.body;

        const regNo = (rollNumber || registerNumber || "").trim();

        if (!name || !regNo || !email || !phone || !coachUserId || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: Full Name, Roll Number, Email, Mobile Number, Coach ID, and Password."
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanPhone = phone.trim();

        if (!/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit mobile number."
            });
        }

        // Verify Email OTP
        const emailRecord = emailOtpStore[cleanEmail];
        const isEmailVerified =
            (emailRecord && emailRecord.verified) ||
            (emailRecord && emailOtp && emailRecord.otp === emailOtp.trim() && Date.now() <= emailRecord.expiresAt);

        if (!isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Institutional Email has not been verified with a valid OTP. Please complete email verification."
            });
        }

        // Check if email already registered in Users
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email address already exists."
            });
        }

        // Check if register number already registered
        const existingStudent = await Student.findOne({
            $or: [
                { registerNumber: regNo },
                { email: cleanEmail }
            ]
        });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "A student with this Roll/Register Number or email already exists."
            });
        }

        // Verify Coach exists
        const coach = await Coach.findOne({
            $or: [
                { userId: coachUserId.trim() },
                { _id: coachUserId.match(/^[0-9a-fA-F]{24}$/) ? coachUserId : null }
            ]
        });

        if (!coach) {
            return res.status(400).json({
                success: false,
                message: `Coach with ID '${coachUserId}' does not exist. Please select a valid coach.`
            });
        }

        // Find or link the coach's team
        let team = null;
        if (coach.teamId) {
            team = await Team.findById(coach.teamId);
        }
        if (!team) {
            team = await Team.findOne({
                $or: [
                    { coachId: coach._id },
                    { name: coach.teamName || `${coach.sport} Team` }
                ]
            });
        }

        // Generate unique Student ID
        const studentCount = await Student.countDocuments();
        const generatedStudentId = `STU${String(studentCount + 1).padStart(3, "0")}`;

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. Create User account with status: "pending"
        const newUser = await User.create({
            userId: generatedStudentId,
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            role: "student",
            status: "pending"
        });

        // 2. Create Student profile with approvalStatus: "pending"
        const newStudent = await Student.create({
            studentId: generatedStudentId,
            userId: newUser._id,
            name: name.trim(),
            email: cleanEmail,
            registerNumber: regNo,
            phone: cleanPhone,
            department: department ? department.trim() : "General",
            year: year ? Number(year) : 1,
            coachId: coach._id,
            coachUserId: coach.userId,
            teamId: team ? team._id : coach.teamId || null,
            approvalStatus: "pending"
        });

        // Add student to Team members list if team exists
        if (team) {
            if (!team.students.includes(newStudent._id)) {
                team.students.push(newStudent._id);
                await team.save();
            }
        }

        // Clean up email OTP record
        delete emailOtpStore[cleanEmail];

        // Log Activity
        try {
            await Activity.create({
                type: "Student Registration",
                message: `New student registration: ${name.trim()} (${regNo}) assigned to Coach ${coach.name} (Squad: ${coach.teamName || team?.name || "General Squad"}). Awaiting admin approval.`,
                userId: newUser._id,
                role: "student"
            });
        } catch (logErr) {
            console.warn("Activity log failed:", logErr.message);
        }

        return res.status(201).json({
            success: true,
            message: "Registration submitted successfully! Your account is pending administrator approval. You will be able to log in once approved.",
            student: {
                studentId: newStudent.studentId,
                name: newStudent.name,
                email: newStudent.email,
                registerNumber: newStudent.registerNumber,
                phone: newStudent.phone,
                coachName: coach.name,
                teamName: coach.teamName || team?.name || `${coach.sport} Team`,
                status: "pending"
            }
        });

    } catch (error) {
        console.error("Student registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Student registration failed",
            error: error.message
        });
    }
};

// =====================================================
// LOGIN
// =====================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check if student registration is pending approval
        if (user.status === "pending") {
            return res.status(403).json({
                message: "Your registration is pending administrator approval. Please wait for approval before logging in."
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                message: "Account is inactive. Please contact the administrator."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user.userId,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    login,
    sendEmailVerificationOtp,
    verifyEmailVerificationOtp,
    getAvailableCoaches,
    registerStudent
};