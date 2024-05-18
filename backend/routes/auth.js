require('dotenv').config()
const express = require('express');
const Router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken') // generates a token to identify user,sort of cookie 
const JWT_SECRET = process.env.JWT_SECRET; // for signing web token
const fetchUser = require('../middleware/fetchUserFromToken')
const PassValidator = require('../models/Forgotpass')
const mailer = require('./mailer')
const { getCurrentDateAndTime, sendOtp } = require('./helper')


// Signup Route: OTP verification and account creation
Router.post('/signup/email/verify', [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password cannot be blank').exists(),
    body('password', 'Enter a valid password of minimum 8 digits').isLength({ min: 8 }),
    body('name', 'Enter a valid name of minimum 3 digits').isLength({ min: 3 }),
    body('authcode', 'Enter 6 digit verification code send to your email').isLength({ min: 6 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    // To check wheather the user exists already with the given email
    const user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ success: false, message: "User with given email id already exist." })
    }

    try {

        const storeAuthCode = await PassValidator.findOne({ email: req.body.email });
        if (!storeAuthCode) {
            return res.status(400).json({ message: 'No such user with this email requested to create a new account', success: false });
        }

        if (storeAuthCode.authcode !== req.body.authcode) {
            return res.status(400).json({ message: 'Invalid Verification code', success: false });
        }

        if (storeAuthCode.authcode === req.body.authcode) {
            // Hashing the password
            bcrypt.genSalt(10, async (err, salt) => {
                bcrypt.hash(req.body.password, salt, async (err, hashedPassword) => {

                    const user = await User.create({
                        name: req.body.name,
                        email: req.body.email,
                        username: req.body.email,
                        password: hashedPassword,
                        watchList: ["IBM"]
                    })

                    // to generation a token or a cookie to identify the user 
                    const data = {
                        user: {
                            user: user.id
                        }
                    }

                    const authToken = jwt.sign(data, JWT_SECRET)

                    mailer(req.body.email, 'Account Registeration Successfull', `Hi ${req.body.name},\n\nUser registeration completed successfully.\nThanks for creating account with us.\nIf not done by you please click here\n\nRegards\nAuthify`);

                    return res.status(200).json({ success: true, authToken, message: 'User created successfully' });
                });
            });
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Some error occured" });
    }
})

// Signup Route: Send OTP for email verification
Router.post('/signup/email', [
    body('email', 'Enter a valid email address').isEmail(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success: false, message: "User with given email id already exist." })
        }

        // sending otp for verification of email
        try {
            sendOtp(req, res, 'Verification Code For ACCOUNT CREATION');
        }
        catch (error) {
            console.error(error.message);
            res.status(500).json({ success: false, message: "Some error occured" });
        }
    })


// Signin Route: Login with email and password
Router.post('/signin', [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password cannot be blank').exists(),
    body('password', 'Enter a valid password of minimum 8 digits').isLength({ min: 8 }),

], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }
    try {

        // if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User with given email id does not exist." });
        }

        // To compare hashed password
        bcrypt.compare(req.body.password, user.password, async (err, compareResult) => {
            if (compareResult === false) {
                return res.status(400).json({ success: false, message: "Invalid email or password" });
            }

            const paylord = {
                user: {
                    user: user.id
                }
            }

            mailer(req.body.email, 'New Login Activity', `Hi ${user.name},\n\nLogin activity for your account detected on ${getCurrentDateAndTime()}\nIf not done by you please click here.\n\nRegards\nAuthify`);
            return res.json({ success: true, authToken: jwt.sign(paylord, JWT_SECRET), message: 'User logged in successfully' });
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Some error occured" });
    }
})


// Route -3 Obtaining details from jwt token
Router.post('/verifyuser', fetchUser, async (req, res) => {
    try {
        const userId = req.userId;
        const userWithId = await User.findById(userId).select('-password');
        if (!userWithId) {
            return res.status(401).send({ success: false, message: "Please authenticate using a valid token" })
        }
        else {
            return res.status(200).json({ success: true, user: userWithId });
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }

})

// Forgot Password Route: Send OTP for password reset
Router.post('/forgot', [
    body('email', 'Enter a valid email address').isEmail(),
], async (req, res) => {

    // to that entered email and password are valid , thay can be misleading or incorrect
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    // if user exists
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User with given email id does not exist." });
        }
        await sendOtp(req, res, 'Verification Code for Password Reset');
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Some error occured" });
    }
})

// Forgot Password Route: Verify OTP and reset password
Router.post('/forgot/verify', [
    body('authcode', 'Enter a valid verification code of 6 digits').isLength({ min: 6 }),
    body('password', 'Enter a valid password of minimum 8 digits').isLength({ min: 8 }),
    body('email', 'Enter a valid email address').isEmail(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }

    try {
        // if user exists
        const storeAuthCode = await PassValidator.findOne({ email: req.body.email });
        if (!storeAuthCode) {
            return res.status(400).json({ success: false, message: 'No such user with this email requested to reset password' });
        }

        console.log(storeAuthCode.authcode, req.body.authcode)

        if (storeAuthCode.authcode === req.body.authcode) {
            bcrypt.genSalt(10, async (err, salt) => {
                bcrypt.hash(req.body.password, salt, async (err, hashedPassword) => {
                    mailer(req.body.email, 'Attention Required !!, Password for your account is recently changed', `Hi There,\n\nRecently, Password of your account is changed on ${getCurrentDateAndTime()}.\nIf not done by you please click here.\n\nRegards\nAuthify`);

                    await User.updateOne({ email: req.body.email }, { password: hashedPassword })
                    return res.json({ success: true, message: "Password Reset Successfully" });
                });
            });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid Verification code' });
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Some error occured" });
    }
})

module.exports = Router