import Users from "../../model/user/user.js";



export const allTransactionHistory = (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }
}

export const fundsTransactionHistory = async (req, res) => {
    const userId = req.params.id
    if(req.user.userId.length < 24) {
        return res.status(400).json("User identity too short.")
    }
    if(req.user.role !== "User") {
        return res.status(400).json("User identity too short.")
    }

    try {
        const user = await Users.findById(req.user.userId).populate("fundsWalletTransactionHistory");
        if(!user) {
            return res.status(404).json("User not found");
        }
        if(user._id.toString() !== userId) {
            return res.status(401).json("Access denied.");
        }

        user.password = undefined;
        user.otp = {
            otpCode: undefined,
            expiresIn: undefined
        }
        return res.status(200).json({ fundsTransactionHistory: user.fundsWalletTransactionHistory })
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
}

export const networkTransactionHistory = (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
}

export const tvTransactionHistory = (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }
}