const nodemailer = require("nodemailer");

/**
 * Email Dispatch Service
 * Delivers real emails via Gmail SMTP, Outlook, Custom SMTP, or logs to terminal outbox.
 */
const sendEmailOtp = async (email, otp, purpose = "registration") => {
    const cleanEmail = email.toLowerCase().trim();
    const isReset = purpose === "password_reset" || purpose === "reset";

    const subject = isReset
        ? "BIT Sports Council - Password Reset Code"
        : "BIT Sports Council - Email Verification Code";

    const textContent = isReset
        ? `Your BIT Sports Council password reset code is: ${otp}. Valid for 10 minutes. Do not share this code.`
        : `Your BIT Sports Council email verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    const subtitle = isReset ? "Password Reset Request" : "Student Athlete Portal Verification";
    const messageBody = isReset
        ? "We received a request to reset the password for your BIT Sports Council account. Please use the following 6-digit verification code to proceed with resetting your password:"
        : "You are registering as a student athlete in the BIT Sports Council. Please use the following 6-digit verification code to verify your email address:";

    const footerNotice = isReset
        ? "If you did not request a password reset, please secure your account immediately or ignore this email."
        : "If you did not request this registration, please ignore this email.";

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #171c22; color: #e5e7eb; padding: 28px; border-radius: 12px; border: 1px solid #28313d;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #05c7ee; margin: 0 0 6px;">BIT Sports Council</h2>
                <p style="color: #8da3b5; font-size: 13px; margin: 0;">${subtitle}</p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; color: #cbd3da;">
                ${messageBody}
            </p>
            
            <div style="text-align: center; margin: 24px 0;">
                <div style="display: inline-block; padding: 14px 28px; background: #0c3329; border: 1px solid #35d49b; border-radius: 8px; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #35d49b;">
                    ${otp}
                </div>
                <p style="font-size: 11px; color: #8da3b5; margin-top: 8px;">Valid for 10 minutes</p>
            </div>
            
            <p style="font-size: 12px; color: #76838e; line-height: 1.4; border-top: 1px solid #28313d; padding-top: 14px; margin: 0;">
                ${footerNotice}
            </p>
        </div>
    `;

    // 1. Check for Email Credentials
    const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
        try {
            console.log(`[EMAIL SERVICE] Attempting email delivery to ${cleanEmail} from ${smtpUser}...`);

            const transporterConfig = smtpUser.includes("@gmail.com")
                ? {
                      service: "gmail",
                      auth: {
                          user: smtpUser,
                          pass: smtpPass
                      }
                  }
                : {
                      host: process.env.SMTP_HOST || "smtp.gmail.com",
                      port: Number(process.env.SMTP_PORT) || 587,
                      secure: Number(process.env.SMTP_PORT) === 465,
                      auth: {
                          user: smtpUser,
                          pass: smtpPass
                      }
                  };

            const transporter = nodemailer.createTransport(transporterConfig);

            const info = await transporter.sendMail({
                from: `"BIT Sports Council" <${smtpUser}>`,
                to: cleanEmail,
                subject,
                text: textContent,
                html: htmlContent
            });

            console.log("[EMAIL SERVICE] Real email delivered successfully! Message ID:", info.messageId);
            return { success: true, provider: "smtp", messageId: info.messageId };
        } catch (err) {
            console.error("[EMAIL SERVICE] Real email dispatch failed:", err.message);
        }
    }

    // 2. Server Console Outbox (when no email credentials are set in .env)
    console.log("==================================================================");
    console.log(`[EMAIL OUTBOX] Target Recipient: ${cleanEmail}`);
    console.log(`[EMAIL OUTBOX] Subject: ${subject}`);
    console.log(`[EMAIL OUTBOX] Verification OTP: ${otp}`);
    console.log("==================================================================");

    return {
        success: true,
        provider: "console",
        info: "To deliver actual inbox emails, add EMAIL_USER and EMAIL_PASS to backend/.env"
    };
};

module.exports = {
    sendEmailOtp
};
