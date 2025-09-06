import { validationResult } from "express-validator"

import Users from "../../model/user/user.js"


export const getProfile = async (req, res) => {
    const userId = req.params.id;
    const result = validationResult(req);
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }
    try {
        const user = await Users.findById(req.user.userId);
        if(!user) {
            return res.status(404).json("User not found");
        }

        if(user._id.toString() !== userId) {
            return res.status(401).json("Access denied.");
        }

        user.otp = undefined;
        user.password = undefined;
        user.nairaWallet = undefined
        user.beneficiaries = undefined
        user.subscriptionHistory = undefined
        user.fundsWalletTransactionHistory = undefined
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json('Something went wrong, Please try again later.');
    }
}


export const getUserBankDetails = async (req, res) => {
    const userId = req.params.id;
    const result = validationResult(req);
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }
    try {
        const user = await Users.findById(req.user.userId).populate("nairaWallet");
        if(!user) {
            return res.status(404).json("User not found");
        }
        if(user._id.toString() !== userId) {
            return res.status(401).json("Access denied. You are not Authenticated.");
        }
        user.nairaWallet.paystackCustomerCode = undefined;
        user.nairaWallet.paystackVirtualAccount.reference = undefined
        return res.status(200).json(user.nairaWallet)
    } catch (error) {
        return res.status(500).json("Internal Server Error.");
    }
}


export const getUserData = async (req, res) => {
    const userId = req.params.userId
    if(req.user.userId.length < 24) {
        return res.status(400).json("User identity too short.")
    }
    const result = validationResult(req);
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }

    try {
        const user = await Users.findById(req.user.userId).populate("nairaWallet");
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
        return res.status(200).json(user) //return user data.
    } catch (error) {
        return res.status(500).json("Internal Server Error.")
    }
}