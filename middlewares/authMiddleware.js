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
        if(err.name === "SyntaxError") {
            return res.status(422).json("Invalid token provided");
        }
        if(err.message === "jwt expired") {
            return res.status(401).json("Your session as expired.")
        }
        return res.status(500).json("Sorry something went wrong.")
    }
}

export default authMiddleware;