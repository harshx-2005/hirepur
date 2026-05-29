const nodemailer = require('nodemailer');
const dns = require('dns');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVICE === 'gmail' || !process.env.SMTP_SERVICE ? 'smtp.gmail.com' : undefined,
    port: process.env.SMTP_SERVICE === 'gmail' || !process.env.SMTP_SERVICE ? 587 : undefined,
    secure: process.env.SMTP_SERVICE === 'gmail' || !process.env.SMTP_SERVICE ? false : undefined,
    service: process.env.SMTP_SERVICE && process.env.SMTP_SERVICE !== 'gmail' ? process.env.SMTP_SERVICE : undefined,
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    },
    lookup: (hostname, options, callback) => {
        // Enforce IPv4 by overriding family to 4
        dns.lookup(hostname, { family: 4 }, callback);
    },
    connectionTimeout: 5000, // 5 seconds connection timeout
    socketTimeout: 5000,     // 5 seconds socket inactivity timeout
    greetingTimeout: 5000    // 5 seconds greeting timeout
});

// Verify SMTP connection on startup
transporter.verify((error) => {
    if (error) {
        console.error('📧 NodeMailer connection failed:', error.message);
    } else {
        console.log('📧 NodeMailer Ready for SMTP transmission.');
    }
});

const sendEmail = async ({ to, subject, html, templateParams }) => {
    // 1. If EmailJS is configured, use the EmailJS secure HTTP REST API! (Zero-dependency & bypasses SMTP blocks)
    const emailJsServiceId = process.env.EMAILJS_SERVICE_ID || 'service_9r20tjd';
    const emailJsOtpTemplateId = process.env.EMAILJS_TEMPLATE_ID || 'template_ai4pjmn';
    const emailJsStatusTemplateId = process.env.EMAILJS_STATUS_TEMPLATE_ID || 'template_awgs1nm';
    const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY || 'mZHBTWxhLXWOyxmnS';
    const emailJsPrivateKey = process.env.EMAILJS_PRIVATE_KEY || 'KhjFProsPfOTPFpVYFCR2';

    // Determine which EmailJS template to use based on the type of email
    let emailJsTemplateId = null;
    if (templateParams?.otp_code && emailJsOtpTemplateId) {
        emailJsTemplateId = emailJsOtpTemplateId;
    } else if (templateParams?.applicant_name && emailJsStatusTemplateId) {
        emailJsTemplateId = emailJsStatusTemplateId;
    }

    if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey && templateParams) {
        try {
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    service_id: emailJsServiceId,
                    template_id: emailJsTemplateId,
                    user_id: emailJsPublicKey,
                    accessToken: emailJsPrivateKey || undefined,
                    template_params: templateParams
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `HTTP Status ${response.status}`);
            }
            console.log(`📧 EmailJS HTTP API successfully dispatched email to ${to} (template: ${emailJsTemplateId})`);
            return { success: true };
        } catch (error) {
            console.error('📧 EmailJS HTTP dispatch error:', error.message);
            // Fallback to Resend or NodeMailer if this fails
        }
    }

    // 2. If Resend API Key is configured, use the high-performance HTTP REST API to bypass SMTP network blocks!
    if (process.env.RESEND_API_KEY) {
        try {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: `HirePur Team <${fromEmail}>`,
                    to: [to],
                    subject: subject,
                    html: html
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Resend HTTP API failure');
            }
            console.log(`📧 Resend HTTP API successfully dispatched email to ${to} (ID: ${data.id})`);
            return data;
        } catch (error) {
            console.error('📧 Resend HTTP dispatch error:', error.message);
        }
    }

    // 3. Fallback to standard SMTP (NodeMailer)
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
        html: htmlContent,
        templateParams: {
            to_email: email,
            subject: `[HirePur] ${title} - OTP: ${otp}`,
            title: title,
            message_text: messageText,
            otp_code: otp
        }
    });
};

const sendApplicationStatusUpdate = async (email, name, jobTitle, status) => {
    const formattedStatus = status.replace('_', ' ').toUpperCase();
    const subject = `[HirePur] Application Status Update: ${formattedStatus}`;
    
    let statusColor = '#475569'; // Slate for applied
    let statusText = 'Applied';
    let statusDescription = 'Your application has been successfully submitted and is in the recruiter queue.';

    if (status === 'under_review') {
        statusColor = '#2563eb'; // Blue
        statusText = 'Under Review';
        statusDescription = 'The recruitment team is actively reviewing your application, qualifications, and profile details.';
    } else if (status === 'interview') {
        statusColor = '#9333ea'; // Shortlist / Interview
        statusText = 'Shortlisted';
        statusDescription = 'Congratulations! You have been shortlisted. The hiring manager will contact you shortly to schedule an interview.';
    } else if (status === 'accepted') {
        statusColor = '#16a34a'; // Green
        statusText = 'Hired';
        statusDescription = 'Excellent news! You have been selected for this position. The onboarding team will be in touch with your formal offer letters shortly.';
    } else if (status === 'rejected') {
        statusColor = '#dc2626'; // Red
        statusText = 'Rejected';
        statusDescription = 'Thank you for your interest in this role. Unfortunately, after careful review, we have decided to pursue other candidates whose profiles align more closely with our current requirements.';
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Application Status Update</title>
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
                    <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Hello ${name},</h2>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; font-weight: 500;">
                        There has been an update to your application status for the position of <strong style="color: #0f172a;">${jobTitle}</strong>.
                    </p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                        <tr>
                            <td align="center" style="padding: 24px; background-color: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0;">
                                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 8px;">New Status</div>
                                <div style="display: inline-block; padding: 6px 16px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #ffffff; background-color: ${statusColor}; border-radius: 9999px;">
                                    ${statusText}
                                </div>
                                <p style="margin: 16px 0 0 0; font-size: 13px; line-height: 1.5; color: #475569; font-weight: 500; max-width: 400px;">
                                    ${statusDescription}
                                </p>
                            </td>
                        </tr>
                    </table>

                    <p style="margin: 0 0 30px 0; font-size: 13px; line-height: 1.6; color: #64748b; font-weight: 500;">
                        Log in to your candidate dashboard to view more details, check your application timeline, or message the recruiter directly.
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
        subject: subject,
        html: htmlContent,
        templateParams: {
            to_email: email,
            subject: subject,
            applicant_name: name,
            job_title: jobTitle,
            status_text: statusText,
            status_description: statusDescription
        }
    });
};

module.exports = { sendEmail, sendOtpEmail, sendApplicationStatusUpdate };
