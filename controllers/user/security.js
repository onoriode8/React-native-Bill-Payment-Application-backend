import bcryptjs from 'bcryptjs'
import otpGenerator from 'otp-generator'
import { validationResult } from 'express-validator'


import Users from '../../model/user/user.js'
import { generateOTP } from '../../util/security.js';
import sendEmailFunc from '../../util/sendingEmail.js';


export const verifyEmailByOTP = async (req, res) => {
    const otpCode = req.body.otpCode
    const code = otpCode.toString()
    const userId = req.params.userId;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }

    if(typeof(code) !== "string") { 
        return res.status(422).json("Invalid code provided.") 
    }

    if(code.length !== 6) {
        return res.status(422).json("Invalid data provided")
    }

    try {
        const user = await Users.findById(req.user.userId)
        if(!user) return res.status(404).json("User not found")
        
        if(userId !== req.user.userId) {
            return res.status(401).json("Not allowed.")
        }
        const codeDateSent = new Date(Date.now()).toString().split(" ")[4];
        if(codeDateSent > user.otp.expiresIn) {
            return res.status(419).json("Code Expired, login to continue.")
        }
 
        const isValid = await bcryptjs.compare(code, user.otp.otpCode) 
        if(!isValid) return res.status(422).json("Invalid code entered.");
        user.isEmailVerified = true
        await user.save()
        return res.status(200).json("Email verified, Login to use the app.")
    } catch (error) {
        return res.status(500).json("Server Error.");
    }
}


//export const setupTwoFactorAuthenticator = () => {}


//export const setupPassCode = () => {}


export const sendEmailToResetPassword = async (req, res) => {
    const email = req.body.email;

    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`Invalid ${error.path} passed.`);
        }
    }

    try {
        const user = await Users.findOne({ email })
        if(!user) return res.status(404).json("User not found");
        const { uniqueOTP } = await generateOTP(user); //generate otp 6 digit unique code.
        const subject = `A Request To Reset Your BillQuick Password`
        const message = `
            Dear valued BillQuick user,

            We got a request to reset your password,

            if it wasn't from you please ignore this message.

            Your 6 digit code to reset your password is ${uniqueOTP}
        `
        const htmlContent = `
            ${message}.
            Your code will expires in 15 minutes.
        `
        await user.save()
        await sendEmailFunc(user.email, subject, message, htmlContent);
        return res.status(200).json(user.email); //send user email to frontend.
    } catch (err) {
        return res.status(500).json("Internal Server Error")
    }
}


export const verifyCodeByEmail = async (req, res) => {
    const { email, otpCode } = req.body;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json("Invalid value passed.")
        }
    }

    if(otpCode.length !== 6) {
        return res.status(422).json("Invalid data provided")
    }

    try {
        const user = await Users.findOne({ email })
        if(!user) {
            return res.status(404).json("User not found")
        }
        const codeDateSent = new Date(Date.now()).toString().split(" ")[4];
        if(codeDateSent > user.otp.expiresIn) {
            return res.status(419).json("Code Expired, try again later.")
        }
 
        const isValid = await bcryptjs.compare(otpCode, user.otp.otpCode) 
        if(!isValid) return res.status(422).json("Invalid code entered.");
        return res.status(200).json(user.email); //now give access to user to enter new password.
    } catch (error) {
        return res.status(500).json("Internal Server Error.");
    }
}


export const resetPassword = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if(password !== confirmPassword) {
        return res.status(422).json("Password must match.")
    }
    if(password.length < 8){
        return res.status(422).json("Password must be at least 8 characters long.")
    }
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json("Invalid value passed.")
        }
    }

    try {
        const user = await Users.findOne({ email })
        if(!user) return res.status(404).json("User not found");
        const hashedPassword = await bcryptjs.hash(password, 12);
        user.password = hashedPassword;
        await user.save();
        const subject = `Your BillQuick Password Was Reset`
        const message = `
            Dear valued BillQuick user,

            if you think your account was compromise,

            please contact us via email with your registered email.
        `
        const htmlContent = `
            ${message}

            To enhance your account security, consider

            enabling Google Two-Factor Authentication (2FA)
        `
        await sendEmailFunc(user.email, subject, message, htmlContent)
        return res.status(200).json("Password added successfully. Login to use your account.")
    } catch (error) {
        return res.status(422).json("Something went wrong, please try again later.")
    }
}