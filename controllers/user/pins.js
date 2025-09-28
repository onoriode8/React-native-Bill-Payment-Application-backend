import bcrypt from "bcryptjs";
import { validationResult } from "express-validator"

import User from "../../model/user/user.js";
import UserSecurity from '../../model/user/security.js'



export const createPaymentPin = async(req, res) => {
    const userId = req.params.userId;
    const newPaymentPin = req.body.newPaymentPin //number
    
    const result = validationResult(req)
    if(!result.isEmpty) {
        for(const errors of result.errors) {
            return res.status(422).json(`Invalid data entered.`);
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
        const extractedPinToString = newPaymentPin.toString();
        hashedPaymentPin = await bcrypt.hash(extractedPinToString, 12)
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }

    let security;
    try {
        security = await UserSecurity.findById(user.security._id);
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
    // console.log("hashed", hashedPaymentPin);
    if(!hashedPaymentPin) {
        return res.status(400).json("Pin not set. Try again later.");
    }

    // console.log("SECURITY MODEL", security);

    user.security.paymentPin = hashedPaymentPin
    user.isPaymentPinSet = true
    security.paymentPin = hashedPaymentPin

    // console.log("existing pin", user.security)
    // console.log("SECURITY MODEL 2", security.paymentPin);


    try {
        const [updatedSecurity, updatedUser] = await Promise.all([security.save(), user.save()]);
        // console.log("UPDATED SECURITY", updatedSecurity);
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
    const selectedNumber = req.body.selectedNumber // 5782
    if(typeof selectedNumber !== "number") {
        return res.status(400).json("pin must be a number");
    }
    const extractedPinToString = selectedNumber.toString() //converted to string
    const result = validationResult(req)
    if(!result.isEmpty) {
        for(const errors of result.errors) {
            return res.status(422).json(`Invalid data entered.`)
        }
    }

    if(extractedPinToString.length !== 4) {
        return res.status(422).json(`Invalid pin entered.`);
    }

    // console.log("EXTRACTED-PIN", extractedPinToString);

    let user;
    try {
        user = await User.findById(req.user.userId).populate("security")
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
    
    // console.log("SECURITY", user.security);
    if(req.user.userId !== userId) {
        return res.status(401).json("Access Denied.");
    }

    if(!user.isPaymentPinSet) {
        return res.status(401).json("Please create a unique pin and continue.");
    }

    let hashedPaymentPin;
    try {
        hashedPaymentPin = await bcrypt.compare(extractedPinToString, user.security.paymentPin)
        if(!hashedPaymentPin) {
            return res.status(422).json({ message: `Incorrect pin entered.`, isValid: hashedPaymentPin});
        }
        // console.log("PAyment pin", hashedPaymentPin);
        return res.status(200).json({ message: "verified", isValid: hashedPaymentPin });
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}


export const ResetPaymentPin = async(req, res) => {
    const userId = req.params.userId;
    const { formattedNewPaymentPin, formattedConfirmedPaymentPin } = req.body // 5782
    if(typeof formattedConfirmedPaymentPin !== "number" 
        && typeof formattedNewPaymentPin !== "number") {
            return res.status(400).json("pin must be a number.");
    }

    if(formattedNewPaymentPin !== formattedConfirmedPaymentPin) {
        return res.status(422).json("Pin must match.");
    }

    if(formattedNewPaymentPin.toString().length !== 4) {
        return res.status(422).json(`Invalid pin entered.`);
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

    if(!user.isPaymentPinSet) {
        return res.status(400).json("Create payment pin first.");
    }

    let security;
    try {
        security = await UserSecurity.findById(user.security._id);
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }

    let hashedPaymentPin;
    try {
       hashedPaymentPin = await bcrypt.hash(formattedNewPaymentPin.toString(), 12) 
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }

    try {
        user.security.paymentPin = hashedPaymentPin
        security.paymentPin = hashedPaymentPin
        const [ updatedSecurity, updatedUser] = await Promise.all([security.save(), user.save()])
        return res.status(200).json("Pin changed successfully.");
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}


export const changePaymentPin = async() => {
    const userId = req.params.userId;
    const { formattedOldPaymentPin, formattedNewPaymentPin, 
        formattedConfirmedPaymentPin } = req.body // 5782
    if(typeof formattedOldPaymentPin !== "number" 
        && typeof formattedNewPaymentPin !== "number") {
            return res.status(400).json("pin must be a number");
    }

    if(formattedNewPaymentPin !== formattedConfirmedPaymentPin) {
        return res.status(422).json("Pin must match");
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

    if(!user.isPaymentPinSet) {
        return res.status(400).json("Create payment pin first.");
    }

    let hashedPaymentPin;
    try {
       hashedPaymentPin = await bcrypt.compare(formattedNewPaymentPin.toString(), user.security.paymentPin);
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
    if(!hashedPaymentPin) {
        return res.status(422).json({ message: `Incorrect pin entered.` });
    }

    let security;
    try {
        security = await UserSecurity.findById(user.security._id);
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }

    try {
        const newPaymentPin = await bcrypt.hash(formattedNewPaymentPin.toString(), 12)
        user.security.paymentPin = newPaymentPin
        security.paymentPin = newPaymentPin
        await Promise.all([security.save(), user.save()])
        return res.status(200).json("Pin changed successfully.");
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
}