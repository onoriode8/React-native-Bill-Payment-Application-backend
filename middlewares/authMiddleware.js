import jwt from "jsonwebtoken";

import Users from '../model/user/user.js'



const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if(!token) {
            return res.status(400).json("Invalid indentity passed.")
        }
        const decodedToken = jwt.verify(token, process.env.AccessToken)
        if(!decodedToken) {
            return res.status(401).json("Not Authenticated")
        }
        req.user = { 
            userId: decodedToken.id,
            role: decodedToken.role,  //role of either admin | user
            email: decodedToken.email,
            // username: decodedToken.username
        }
        const user = await Users.findById(req.user.userId)
        if(!user) return res.status(404).json("User not found");
        next()
    } catch(err) {
        console.error(err.message)
        if(err.message === "expires") { //check if the expires is the actual jwt expire token.
            return res.status(401).json("Your session as expired.")
        }
        return res.status(500).json("Internal Server Error")
    }
}

export default authMiddleware;