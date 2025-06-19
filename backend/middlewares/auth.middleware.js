import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Configs from '../configs/index.configs.js';

const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: 'Failed',
                message: "No authentication token, access denied."
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const decoded = jwt.verify(token, Configs.JWT_SECRET);

        // ✅ Ensure this matches your token payload
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                status: 'Failed',
                message: "Token is not valid."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            status: 'Failed',
            message: "Token is not valid"
        });
    }
};

export default protectRoute;