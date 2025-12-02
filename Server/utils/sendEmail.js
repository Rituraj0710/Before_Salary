import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message, code: err.code };
  }
}

export async function sendOTPEmail(to, otp, purpose = "verification") {
  const subject = `Your OTP for ${purpose}`;
  const html = `
    <div style="font-family:sans-serif; line-height:1.6">
      <h2>Your OTP Code</h2>
      <p>Your OTP for <strong>${purpose}</strong> is:</p>
      <h1 style="font-size:32px; letter-spacing:2px">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    </div>
  `;
  const text = `OTP for ${purpose}: ${otp} (expires in 10 minutes)`;
  return sendEmail({ to, subject, html, text });
}
