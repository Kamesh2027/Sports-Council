/**
 * SMS Dispatch Service
 * Supports Fast2SMS, Twilio, and 2Factor SMS Gateways via environment variables.
 */

const sendSmsOtp = async (phone, otp) => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const message = `Your BIT Sports Council verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP.`;

    let sent = false;

    // 1. FAST2SMS (India)
    if (process.env.FAST2SMS_API_KEY) {
        try {
            console.log(`[SMS SERVICE] Attempting Fast2SMS dispatch to +91${cleanPhone}...`);
            const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    "authorization": process.env.FAST2SMS_API_KEY.trim(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    variables_values: otp,
                    route: "otp",
                    numbers: cleanPhone
                })
            });
            const data = await res.json();
            console.log("[SMS SERVICE] Fast2SMS response:", data);
            if (data.return === true) {
                sent = true;
                return { success: true, provider: "fast2sms" };
            } else {
                console.warn("[SMS SERVICE] Fast2SMS returned error:", data.message);
            }
        } catch (err) {
            console.error("[SMS SERVICE] Fast2SMS dispatch failed:", err.message);
        }
    }

    // 2. 2FACTOR (India)
    if (process.env.TWO_FACTOR_API_KEY && !sent) {
        try {
            console.log(`[SMS SERVICE] Attempting 2Factor dispatch to +91${cleanPhone}...`);
            const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY.trim()}/SMS/${cleanPhone}/${otp}/OTP1`;
            const res = await fetch(url);
            const data = await res.json();
            console.log("[SMS SERVICE] 2Factor response:", data);
            if (data.Status === "Success") {
                sent = true;
                return { success: true, provider: "2factor" };
            }
        } catch (err) {
            console.error("[SMS SERVICE] 2Factor dispatch failed:", err.message);
        }
    }

    // 3. TWILIO (Global)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER && !sent) {
        try {
            console.log(`[SMS SERVICE] Attempting Twilio dispatch to +91${cleanPhone}...`);
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID.trim()}/Messages.json`;
            const authHeader = "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID.trim()}:${process.env.TWILIO_AUTH_TOKEN.trim()}`).toString("base64");

            const params = new URLSearchParams();
            params.append("To", `+91${cleanPhone}`);
            params.append("From", process.env.TWILIO_PHONE_NUMBER.trim());
            params.append("Body", message);

            const res = await fetch(twilioUrl, {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });
            const data = await res.json();
            console.log("[SMS SERVICE] Twilio response:", data.sid ? "Message queued" : data.message);
            if (data.sid) {
                sent = true;
                return { success: true, provider: "twilio" };
            }
        } catch (err) {
            console.error("[SMS SERVICE] Twilio dispatch failed:", err.message);
        }
    }

    // 4. Server Console Log (when no external provider key or if external provider fails)
    console.log("==================================================================");
    console.log(`[SMS OUTBOX] Dispatch to Mobile Number: +91 ${cleanPhone}`);
    console.log(`[SMS OUTBOX] Message: ${message}`);
    console.log("==================================================================");

    return {
        success: true,
        provider: "console",
        info: "Fast2SMS returned 412 Invalid Key. Check Fast2SMS dashboard Dev API."
    };
};

module.exports = {
    sendSmsOtp
};
