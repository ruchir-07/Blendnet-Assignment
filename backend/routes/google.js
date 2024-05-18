const express = require('express');
const User = require('../models/User')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET;
const mailer = require('./mailer.js')
const Router = express.Router();
const {getCurrentDateAndTime} = require('./helper.js')

// Passport middleware to authenticate user
passport.use(User.createStrategy());

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://stockify-backend.azurewebsites.net/auth/google/hello",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, async function (accessToken, refreshToken, profile, cb) {
    if (profile._json.email_verified == true) {
        try {

            let user = await User.findOne({ email: profile._json.email });
            if (!user) {
                user = await User.create({
                    name: profile._json.name,
                    email: profile._json.email,
                    username: profile._json.email,
                    password: null,
                    googleId: profile.id,
                    watchList: ["IBM"]
                })

                mailer(user.email, 'Account Registeration Successfull', `Hi ${user.name},\n\nUser registeration completed successfully.\nThanks for creating account with us.\nIf not done by you please click here\n\nRegards\nAuthify`);
            }
            else {
                mailer(user.email, 'New Login Activity', `Hi ${user.name},\n\nLogin activity for your account detected on ${getCurrentDateAndTime()}\nIf not done by you please click here.\n\nRegards\nAuthify`);
            }
            
            const data = {
                user: {
                    user: user.id
                }
            }

            cb(null, { authToken: jwt.sign(data, JWT_SECRET) });
        }

        catch (error) {
            console.error(error.message);
            cb(error, null);
        }
    }
}));

// Google Auth Route
Router.get('/', (req, res, next) => {
    passport.authenticate('google', {
        scope: ['email', 'profile'],
        state: req.query.url // Pass the URL as state
    })(req, res, next);
});

// Callback Route
Router.get('/hello',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const { authToken } = req.user;
        const redirectUrl = `${req.query.state}?authToken=${authToken}`; // Append authToken to the provided URL
        res.redirect(redirectUrl);
    }
);

module.exports = Router;
