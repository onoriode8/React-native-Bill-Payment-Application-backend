import bcrypt from "bcryptjs";
import { validationResult } from "express-validator"

import User from "../../model/user/user.js";



export const createPaymentPin = async(req, res) => {
    const userId = req.params.userId;
    const newPaymentPin = req.body //req.body.newPaymentPin
    if(newPaymentPin.length !== 4) {
        return res.status(422).json(`Invalid pin entered.`);
    }
    const extractedPin = Number(newPaymentPin.join(""))
    const result = validationResult(req)
    if(!result.isEmpty) {
        for(const errors of result.errors) {
            return res.status(422).json(`Invalid data entered.`)
        }
    }

    if(req.user.role !== "User") {
        return res.status(401).json("Not allowed.")
    }

    let user;
    try {
        user = await User.findById(req.user.userId).populate("security")
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
    
    if(req.user.userId !== userId) {
        return res.status(401).json("Access Denied.");
    }

    if(user.isPaymentPinSet) {
        return res.status(400).json("Payment pin already set.");
    }

    let hashedPaymentPin;
    try {
        hashedPaymentPin = await bcrypt.hash(extractedPin, 12)
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }

    user.security.paymentPin = hashedPaymentPin
    user.isPaymentPinSet = true

    try {
        const updatedUser = await user.save()
        // updatedUser.password = undefined
        // updatedUser.otp = undefined
        // updatedUser.beneficiaries = undefined
        // updatedUser.subscriptionHistory = undefined
        // updatedUser.allTransactionHistory = undefined
        // updatedUser.fundsWalletTransactionHistory = undefined
        return res.status(200).json({
            message: "Payment pin set",
            isPaymentPinSet: updatedUser.isPaymentPinSet
        });
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
}


export const verifyUserPaymentPin = async (req, res) => {
    const userId = req.params.userId;
    const selectedNumber = req.body.selectedNumber
    if(selectedNumber.length !== 4) {
        return res.status(422).json(`Invalid pin entered.`);
    }
    const extractedPin = Number(selectedNumber.join(""))
    const result = validationResult(req)
    if(!result.isEmpty) {
        for(const errors of result.errors) {
            return res.status(422).json(`Invalid data entered.`)
        }
    }

    console.log("EXTRACTED-PIN", extractedPin);

    let user;
    try {
        user = await User.findById(req.user.userId).populate("security")
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
    
    if(req.user.userId !== userId) {
        return res.status(401).json("Access Denied.");
    }
}