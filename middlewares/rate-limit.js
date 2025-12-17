import expressRateLimit from "express-rate-limit"

import Users from '../model/user/user.js'


const rateLimit = expressRateLimit({
    limit: 4,
    windowMs: 60000 * 15, // 15 minutes
    message: "Too many request, please try again after 15 minutes.",
    statusCode: 429,
    standardHeaders: false,
    legacyHeaders: false,
    keyGenerator: async (req, res) => {
        try {
            const user = await Users.findOne({ email: req.body.email })
            if(!user) {
                throw new Error("User not found.")
                // return res.status(404).json("User not found.")
            }
            req.body.email || req.body.username
        } catch(err) {
            if(err.message === "User not found.") {
                throw new Error(err.message);
            }
            throw new Error("Something went wrong.");
            // return res.status(500).json("Something went wrong.")
        }
        // req.body.email || req.body.username
    }
})


export default rateLimit;