// notifications/email.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmailNotification = async (email, subject, message) => {
    const msg = {
        to: email,
        from: 'your-email@example.com', // Use your verified email
        subject,
        text: message,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
