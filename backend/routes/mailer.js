require('dotenv').config()
const nodemailer = require('nodemailer');
const mailPass = process.env.EMAIL_PASS2;

// Function to send mail
const mailer = (to, sub, body) => {
    return new Promise((resolve, reject) => {
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'developer.authify@gmail.com',
                pass: mailPass
            }
        });

        const mailOptions = {
            from: 'developer.authify@gmail.com',
            to: to,
            subject: sub,
            text: body,
        };

        try {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    reject(false)
                } else {
                    console.log('Email sent: ' + info.response);
                    resolve(true)
                    return true
                }
            });
        } catch (error) {
            console.error(error.message);
            reject(false)
        }
    });
}

module.exports = mailer