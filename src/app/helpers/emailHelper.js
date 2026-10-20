const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });
    }
    return transporter;
}

/**
 * Hàm gửi email dùng chung
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung email
 */
const sendEmail = async (to, subject, htmlContent) => {
    const activeTransporter = getTransporter();
    if (!activeTransporter) {
        console.warn(`[emailHelper] Missing EMAIL_USER or EMAIL_PASS environment variables. Skipping email to: ${to}`);
        return false;
    }

    try {
        const mailOptions = {
            from: `"UCC Library Management System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        const info = await activeTransporter.sendMail(mailOptions);
        console.log('Email sent successfully: ' + info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email: ', error.message || error);
        return false;
    }
};

module.exports = { sendEmail };