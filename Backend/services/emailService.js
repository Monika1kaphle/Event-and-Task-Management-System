const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * ── Admin/Dept Head Invitation OTP ──
 * Now supports a 'role' parameter to distinguish between 
 * Department Heads and Members in the email body.
 */
const sendOTPEmail = async (targetEmail, otp, role = 'DEPT_HEAD') => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-otp`;

    // Determine the text to show based on the role passed from controller
    const roleDisplay = role === 'MEMBER' ? 'Member' : 'Department Head';

    const mailOptions = {
        from: `"E&T System" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: 'You have been invited Verify your OTP', // Removed the — dash
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

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

          <tr>
            <td style="background-color:#161b22;border:1px solid #30363d;border-radius:16px;padding:36px 32px;">

              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#ffffff;">
                You've been invited 🎉
              </h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#9ca3af;line-height:1.6;">
                An admin has invited you to join the E&amp;T Management system as a <strong style="color:#4fd1c5;">${roleDisplay}</strong>.
                Use the OTP below to verify your identity and set up your account.
              </p>

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

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}"
                       style="display:inline-block;background-color:#2d5f5d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Verify OTP
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px 0;font-size:12px;color:#9ca3af;text-align:center;">
                Or open this link in your browser:<br>
                <a href="${verifyUrl}" style="color:#4fd1c5;word-break:break-all;">${verifyUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #30363d;margin:0 0 20px 0;">

              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                ⏱ This OTP is valid for <strong style="color:#9ca3af;">10 minutes</strong>.
                Do not share it with anyone. If you did not expect this invitation, you can safely ignore this email.
              </p>

            </td>
          </tr>

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

// ── Task Assignment Notification Email ──
const sendTaskAssignmentEmail = async (targetEmail, assigneeName, taskTitle, taskDescription, deptName, deadline, createdBy) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const mailOptions = {
        from: `"E&T System" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: `📋 New Task Assigned: ${taskTitle}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

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

          <tr>
            <td style="background-color:#161b22;border:1px solid #30363d;border-radius:16px;padding:36px 32px;">

              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#ffffff;">
                📋 New Task Assigned
              </h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#9ca3af;line-height:1.6;">
                Hi <strong>${assigneeName}</strong>, you have been assigned a new task. Check the details below:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#0d1117;border:1px solid #2d5f5d;border-radius:12px;padding:24px;text-align:left;">
                    
                    <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;color:#4fd1c5;text-transform:uppercase;letter-spacing:1px;">
                      Task
                    </p>
                    <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#ffffff;">
                      ${taskTitle}
                    </h2>

                    ${taskDescription ? `
                    <p style="margin:0 0 16px 0;font-size:13px;color:#9ca3af;line-height:1.6;">
                      <strong>Description:</strong><br/>
                      ${taskDescription}
                    </p>
                    ` : ''}

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #30363d;padding-top:16px;">
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#9ca3af;">
                          <strong>Department:</strong>
                        </td>
                        <td style="padding:8px 0;font-size:13px;color:#ffffff;font-weight:600;text-align:right;">
                          ${deptName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#9ca3af;">
                          <strong>Created By:</strong>
                        </td>
                        <td style="padding:8px 0;font-size:13px;color:#ffffff;font-weight:600;text-align:right;">
                          ${createdBy}
                        </td>
                      </tr>
                      ${deadline ? `
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#9ca3af;">
                          <strong>Deadline:</strong>
                        </td>
                        <td style="padding:8px 0;font-size:13px;color:#ffffff;font-weight:600;text-align:right;">
                          ${new Date(deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                      </tr>
                      ` : ''}
                    </table>

                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/tasks"
                       style="display:inline-block;background-color:#2d5f5d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      View Task Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #30363d;margin:0 0 20px 0;">

              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                You are receiving this email because a task has been assigned to you in the E&amp;T Management System. 
                Please log in to the system to view more details and update your progress.
              </p>

            </td>
          </tr>

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

// ── Task Update Notification Email ──
const sendTaskUpdateEmail = async (deptHeadEmail, deptHeadName, memberName, taskTitle, status, progress, workDone) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const mailOptions = {
        from: `"E&T System" <${process.env.EMAIL_USER}>`,
        to: deptHeadEmail,
        subject: `📝 Task Update: ${taskTitle} - ${status === 'COMPLETED' ? 'COMPLETED' : 'IN PROGRESS'}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

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

          <tr>
            <td style="background-color:#161b22;border:1px solid #30363d;border-radius:16px;padding:36px 32px;">

              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#ffffff;">
                📝 Task Update Received
              </h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#9ca3af;line-height:1.6;">
                Hi <strong>${deptHeadName}</strong>, <strong style="color:#4fd1c5;">${memberName}</strong> has provided an update on their assigned task.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#0d1117;border:1px solid #2d5f5d;border-radius:12px;padding:24px;text-align:left;">
                    
                    <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;color:#4fd1c5;text-transform:uppercase;letter-spacing:1px;">
                      Task Title
                    </p>
                    <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#ffffff;">
                      ${taskTitle}
                    </h2>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #30363d;padding-top:16px;">
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#9ca3af;">
                          <strong>Member:</strong>
                        </td>
                        <td style="padding:8px 0;font-size:13px;color:#ffffff;font-weight:600;text-align:right;">
                          ${memberName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#9ca3af;">
                          <strong>Status:</strong>
                        </td>
                        <td style="padding:8px 0;font-size:13px;text-align:right;">
                          <span style="display:inline-block;padding:4px 12px;border-radius:6px;background-color:${status === 'COMPLETED' ? '#10b981' : status === 'IN_PROGRESS' ? '#4fd1c5' : '#6b7280'};color:white;font-weight:600;font-size:12px;">
                            ${status === 'COMPLETED' ? '✓ COMPLETED' : status === 'IN_PROGRESS' ? '⟳ IN PROGRESS' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#9ca3af;">
                          <strong>Progress:</strong>
                        </td>
                        <td style="padding:8px 0;font-size:13px;color:#ffffff;font-weight:600;text-align:right;">
                          ${progress}%
                        </td>
                      </tr>
                    </table>

                    ${workDone ? `
                    <div style="margin-top:16px;padding-top:16px;border-top:1px solid #30363d;">
                      <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#4fd1c5;text-transform:uppercase;letter-spacing:1px;">
                        Member Update/Comments
                      </p>
                      <p style="margin:0;font-size:13px;color:#e5e7eb;line-height:1.6;white-space:pre-wrap;word-break:break-word;">
                        ${workDone}
                      </p>
                    </div>
                    ` : ''}

                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/dept-dashboard"
                       style="display:inline-block;background-color:#2d5f5d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      View Task Details
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #30363d;margin:0 0 20px 0;">

              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                You are receiving this email because a member in your department has updated an assigned task. 
                Please log in to the system to review the update and provide feedback if needed.
              </p>

            </td>
          </tr>

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

module.exports = { sendOTPEmail, sendLoginOTPEmail, sendTaskAssignmentEmail, sendTaskUpdateEmail };