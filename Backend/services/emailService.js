const nodemailer = require('nodemailer');

const sendOTPEmail = async (targetEmail, otp) => {
  const testAccount = await nodemailer.createTestAccount()
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  const info = await transporter.sendMail({
    from: '"E&T System" <noreply@et.com>',
    to: targetEmail,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family:Arial;padding:32px;border:1px solid #e5e7eb;border-radius:12px;max-width:480px;">
        <h2 style="color:#4fd1c5;">You've been invited!</h2>
        <p>You have been invited as a <strong>Department Head</strong>.</p>
        <p>Your OTP code is:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#111827;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:14px;">Expires in 10 minutes. Use this on the OTP Login tab.</p>
      </div>
    `,
  })

  // ✅ This prints the OTP preview URL in your terminal
  console.log('📧 OTP:', otp)
  console.log('📧 Preview email at:', nodemailer.getTestMessageUrl(info))
}

module.exports = { sendOTPEmail }
