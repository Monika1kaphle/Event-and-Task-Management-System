const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ── Used by Admin invite flow (dept head / member) ──
const sendOTPEmail = async (targetEmail, otp) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-otp`;

    const mailOptions = {
        from: `"E&T System" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: 'You\'ve been invited — Verify your OTP',
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2d5f5d;border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                    <span style="font-size:22px;color:#ffffff;font-weight:bold;line-height:44px;">E</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">E&amp;T Management</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#161b22;border:1px solid #30363d;border-radius:16px;padding:36px 32px;">

              <!-- Title -->
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#ffffff;">
                You've been invited 🎉
              </h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#9ca3af;line-height:1.6;">
                An admin has invited you to join the E&amp;T Management system as a <strong style="color:#4fd1c5;">Department Head</strong>.
                Use the OTP below to verify your identity and set up your account.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="background-color:#0d1117;border:1px solid #2d5f5d;border-radius:12px;padding:24px 32px;display:inline-block;">
                      <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;color:#4fd1c5;text-transform:uppercase;letter-spacing:2px;">
                        Your One-Time Password
                      </p>
                      <p style="margin:0;font-size:42px;font-weight:800;color:#ffffff;letter-spacing:12px;font-family:'Courier New',monospace;">
                        ${otp}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}"
                       style="display:inline-block;background-color:#2d5f5d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Verify OTP &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Or copy link -->
              <p style="margin:0 0 20px 0;font-size:12px;color:#9ca3af;text-align:center;">
                Or open this link in your browser:<br>
                <a href="${verifyUrl}" style="color:#4fd1c5;word-break:break-all;">${verifyUrl}</a>
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #30363d;margin:0 0 20px 0;">

              <!-- Warning -->
              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                ⏱ This OTP is valid for <strong style="color:#9ca3af;">10 minutes</strong>.
                Do not share it with anyone. If you did not expect this invitation, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:11px;color:#4b5563;">
                © ${new Date().getFullYear()} E&amp;T Management System. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `
    };

    return await transporter.sendMail(mailOptions);
};

// ── Used by standard client OTP login ──
const sendLoginOTPEmail = async (targetEmail, otp) => {
    const mailOptions = {
        from: `"E&T System" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: 'Your Login OTP Code',
        html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Your One-Time Login Code</h2>
                <p>Use the code below to sign in to E&T Management:</p>
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
                <p>This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendLoginOTPEmail };