require('dotenv').config()
const express = require('express');
const Router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUserFromToken')

// Get watchlist
Router.get('/', fetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist.", watchList: null });
        }
        return res.status(200).json({ success: true, watchList: user.watchList, message: "Watchlist fetched successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Some error occured", watchList: null });
    }
})

// add to watchlist
Router.post('/add', fetchUser, [
    body('symbol', 'Enter a valid symbol').isLength({ min: 1 }).isString(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Symbol is required" });
    }

    try {

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist." });
        }

        // check if symbol already exists in watchlist
        if (!user.watchList.includes(req.body.symbol)) {
            user.watchList.push(req.body.symbol);
        }

        await user.save();
        return res.status(200).json({ success: true, message: "Symbol added to watchlist" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Some error occured" });
    }
})

// remove from watchlist
Router.post('/remove', fetchUser, [
    body('symbol', 'Enter a valid symbol').isLength({ min: 1 }).isString(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Symbol is required" });
    }

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist." });
        }

        user.watchList = await user.watchList.filter((symbol) => symbol !== req.body.symbol);
        await user.save();

        return res.status(200).json({ success: true, message: "Symbol removed from watchlist" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Some error occured" });
    }
})

module.exports = Router;