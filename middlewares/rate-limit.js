import expressRateLimit from "express-rate-limit"



const rateLimit = expressRateLimit({
    limit: 3,
    windowMs: 60000 * 15, // 15 minutes
    message: "Too many request, please try again after 15 minutes.",
    statusCode: 429,
    standardHeaders: false,
    legacyHeaders: false,
    keyGenerator: (req, res) => req.body.email || req.body.username
})


export default rateLimit;