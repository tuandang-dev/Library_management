const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Hàm gửi email dùng chung
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung email
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"Hệ thống Quản lý Thư viện" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: ' + info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email: ', error);
        return false;
    }
};

module.exports = { sendEmail };