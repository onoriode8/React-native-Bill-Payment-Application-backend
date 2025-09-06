import Users from "../../model/user/user.js";


export const getAllUsers = async (req, res) => {
    console.log("USER ROLE 5 From Admin get-All-USER Controller", req.user.role)
    if(req.user.role !== "Admin") {
        return res.status(403).json("Not Allowed.");
    }
    try {
        const user = await Users.find().populate("nairaWallet");
        if(!user) {
            return res.status(404).json("User not found");
        }
        
        console.log("USER", user)
        user.nairaWallet.paystackCustomerCode = undefined;
        user.nairaWallet.paystackVirtualAccount.reference = undefined
        return res.status(200).json(user.nairaWallet)
    } catch (error) {
        return res.status(500).json("Internal Server Error.");
    }
}


export const getUserBankDetails = async (req, res) => {
    const userId = req.params.id;
    if(userId.length < 24) {
       return res.status(422).json(`Identity not recognized.`);
    }
    console.log("USER ROLE 11 From Admin getUSER-BANK-DETAILS Controller", req.user.role)
    if(req.user.role !== "Admin") {
        return res.status(403).json("Not Allowed.");
    }
    try {
        const user = await Users.findById(userId).populate("nairaWallet");
        if(!user) {
            return res.status(404).json("User not found");
        }
        
        console.log("USER", user)
        user.password = undefined;
        user.otp = undefined;
        user.nairaWallet.paystackCustomerCode = undefined;
        user.nairaWallet.paystackVirtualAccount.reference = undefined
        return res.status(200).json({ userWallet: user.nairaWallet, userData: user })
    } catch (error) {
        return res.status(500).json("Internal Server Error.");
    }
}