const PassValidator = require("../models/Forgotpass");
const mailer = require("./mailer");

// Get current date and time
function getCurrentDateAndTime() {
    const date_IST = new Date();
    //IST is 5:30; i.e. 60*5+30 = 330 in minutes
    offset = 330 * 60 * 1000;
    var date = new Date(date_IST.getTime() + offset);
    return date.getDate() + '-' + (parseInt(date.getMonth() )+ 1) + '-' + date.getFullYear() + ' at ' + date.getHours() + ':' + date.getMinutes();
}

// Send OTP to the user
async function sendOtp(req, res, subject) {
    try {
        await PassValidator.deleteMany({ email: req.body.email })
        const authCode = Math.floor(100000 + Math.random() * 900000);

        if (await mailer(req.body.email, subject, 'Your verification code is ' + authCode)) {
            const storeAuthCode = await PassValidator.create({
                email: req.body.email,
                authcode: authCode,
            })
            
            return res.json({ success: true, message: "Email Send" })
        }
        else {
            console.error(error.message);
            return res.status(500).send("Some error occured");
        }
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = { getCurrentDateAndTime, sendOtp };

