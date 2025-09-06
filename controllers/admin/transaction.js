
import Users from "../../model/user/user.js";



export const allUserTransactionHistory = async (req, res) => {
    const userId = req.params.userId
    if(req.user.role !== "Admin") {
        return res.status(403).json("Forbidden to access this.");
    }
    try {
        const user = await Users.findById(userId).populate("allTransactionHistory");
        if(!user) {
            return res.status(404).json("User not found");
        }

        user.password = undefined;
        user.otp = {
            otpCode: undefined,
            expiresIn: undefined
        }
        return res.status(200).json({ transactionHistory: user.allTransactionHistory })
    } catch (err) {
        return res.status(500).json("Internal Server Error");
    }
}