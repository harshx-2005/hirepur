const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
});

// Verify SMTP connection on startup
transporter.verify((error) => {
    if (error) {
        console.error('📧 NodeMailer connection failed:', error.message);
    } else {
        console.log('📧 NodeMailer Ready for SMTP transmission.');
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `"HirePur Team" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('📧 NodeMailer transmission error:', error);
        throw new Error('Failed to dispatch verification email');
    }
};

const sendOtpEmail = async (email, otp, type = 'registration') => {
    let title = 'Verify Your Email';
    let messageText = 'Thank you for choosing HirePur! Please verify your email address to activate your professional dashboard.';
    
    if (type === 'forgot_password') {
        title = 'Reset Your Password';
        messageText = 'We received a request to recover your password. Please use the verification code below to authorize the password change.';
    } else if (type === 'secure_login') {
        title = 'Secure OTP Verification';
        messageText = 'This is your secure one-time verification password for logging into your account.';
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #f1f5f9;">
            <tr>
                <td style="padding: 40px; text-align: center; background-color: #0f172a; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.05em; color: #ffffff;">HirePur</h1>
                    <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #3b82f6;">AI Recruitment</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 40px 48px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">${title}</h2>
                    <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #475569; font-weight: 500;">
                        ${messageText}
                    </p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                        <tr>
                            <td align="center" style="padding: 24px; background-color: #f1f5f9; border-radius: 20px;">
                                <div style="font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #0f172a; text-indent: 0.25em;">${otp}</div>
                            </td>
                        </tr>
                    </table>

                    <p style="margin: 0 0 30px 0; font-size: 13px; line-height: 1.6; color: #64748b; font-weight: 500;">
                        ⚠️ This verification code is extremely confidential and will **expire in 5 minutes**. If you did not make this request, you can safely ignore this email.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 11px; text-align: center; color: #94a3b8; font-weight: 500;">
                        © ${new Date().getFullYear()} HirePur Inc. All rights reserved. <br>
                        Premium Recruiting Platform & SaaS.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    return sendEmail({
        to: email,
        subject: `[HirePur] ${title} - OTP: ${otp}`,
        html: htmlContent
    });
};

module.exports = { sendEmail, sendOtpEmail };
