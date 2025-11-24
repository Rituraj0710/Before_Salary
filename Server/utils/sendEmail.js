import nodemailer from 'nodemailer';

// Validate email configuration
const validateEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set in environment variables!');
    console.warn('⚠️  Emails will not be sent. Please configure your .env file.');
    return false;
  }
  return true;
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
if (validateEmailConfig()) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
      console.error('📧 Please check your EMAIL_USER and EMAIL_PASS in .env file');
      console.error('📧 For Gmail, you need to use an App Password, not your regular password');
    } else {
      console.log('✅ Email transporter is ready to send emails');
    }
  });
}

export const sendEmail = async (to, subject, html) => {
  // Check if email is configured
  if (!validateEmailConfig()) {
    return { 
      success: false, 
      error: 'Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file' 
    };
  }

  try {
    const mailOptions = {
      from: `"BeforeSalary" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your EMAIL_USER and EMAIL_PASS');
      console.error('📧 For Gmail: Use an App Password, not your regular password');
      return { 
        success: false, 
        error: 'Email authentication failed. Please check your email credentials.' 
      };
    }
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (to, otp, purpose = 'verification') => {
  const subject = purpose === 'login' 
    ? 'Your Login OTP' 
    : purpose === 'application'
    ? 'Your Application OTP'
    : 'Your Verification OTP';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${subject}</h2>
      <p style="color: #666; font-size: 16px;">Your OTP code is:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
    </div>
  `;

  return await sendEmail(to, subject, html);
};


