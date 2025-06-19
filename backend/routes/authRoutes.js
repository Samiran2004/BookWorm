import express, { application } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User.model.js';
import Configs from '../configs/index.configs.js';

const router = express.Router();

const generateToken = async (userId) => {
    return jwt.sign({ userId }, Configs.JWT_SECRET, { expiresIn: "15d" });
}

router.post('/register', async (req, res) => {
    console.log("Hit register route")
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'Failed',
                message: "All fields are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: 'Failed',
                message: "Password should be at least 6 characters long."
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                status: 'Failed',
                message: "Username should be at least 3 charaters long."
            });
        }

        // Check if user already exists...

        const existEmail = await User.findOne({ email: email });
        if (existEmail) {
            return res.status(400).json({
                status: 'Failed',
                message: "Email already exists."
            });
        }

        const existUsername = await User.findOne({ username: username });
        if (existUsername) {
            return res.status(400).json({
                status: 'Failed',
                message: "Username already exists."
            });
        }

        // Get random avatar
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User({
            username: username,
            email: email,
            password: password,
            profileImage: profileImage,
        });

        await user.save();

        const token = await generateToken(user._id);

        return res.status(201).json({
            status: 'Ok',
            message: "Successfully register",
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });


    } catch (error) {
        console.log("Error in register route: ", error);
        return res.status(500).json({
            status: "Failed",
            message: "Internal Server Error"
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'Failed',
                message: "All fields are required."
            });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                status: 'Failed',
                message: "Invalid credentials."
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                status: 'Failed',
                message: "Invalid credentials."
            });
        }

        // Generate token...
        const token = await generateToken(user._id);

        res.status(200).json({
            status: 'Ok',
            message: "Successfully Loggedin",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: 'Failed',
            message: "Internal Server Error."
        });
    }
});

export default router;