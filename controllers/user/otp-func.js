import { validationResult } from "express-validator";


import { generateOTP } from "../../util/security.js";
import { fetchUserDataHelper } from "../../util/helper-func.js";
import sendEmailFunc from "../../util/sendingEmail.js";



export const sendOTPtoPhoneNumber = async(req, res) => {
    const userId = req.params.userId;
    const { to } = req.body; //number
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(
                `${error.msg} phone number passed, number must be 10 character long.`);
        }
    }

    if(typeof(to) !== "number") {
        return res.status(422).json("Phone number must be a number.")
    }

    const { user } = await fetchUserDataHelper(req.user.userId, userId)

    if(to !== user.phoneNumber) {
        return res.status(400).json("Invalid phone number provided.")
    }

    try {
        const { uniqueOTP } = await generateOTP(user);
        //send uniqueOTP to user phone number through twilio or other third party app.
        return res.status(200).json(
            { phoneNumber: user.phoneNumber, message: "code sent to your registered number." })
    } catch(err) {
        return res.status(500).json("Something went wrong.");
    }
}


export const sendOTPtoEmailAddress = async(req, res) => {
    const userId = req.params.userId;
    const { email } = req.body; //string
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} passed.`);
        }
    }

    const { user } = await fetchUserDataHelper(req.user.userId, userId)

    if(email !== user.email) {
        return res.status(400).json("Invalid email provided.")
    }

    const subject = `A Request to Reset Your BillQuick Password`;

    const message = `Dear valued BillQuick user, we got
        A Request to Reset your password.

        If this wasn't you please reset your password immediately,
        to secure your account from hijackers.`;

    try {
        const { uniqueOTP } = await generateOTP(user);
        const htmlContent = ` ${message}
            Your OTP code is ${uniqueOTP}
            It'll expires in 15 minutes from now.
        `
        await sendEmailFunc(user.email, subject, message, htmlContent)
        return res.status(200).json(
            { email: user.email, message: "code sent to your registered email." })
    } catch(err) {
        return res.status(500).json("Something went wrong.");
    }
}


export const resendOTPtoUserData = async(req, res) => {
    const userId = req.params.userId;
    const { to } = req.body; //string
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} passed.`);
        }
    }

    const { user } = await fetchUserDataHelper(req.user.userId, userId)

    // if(email !== user.email) {
    //     return res.status(400).json("Invalid email provided.")
    // }

    const subject = `A Request to Reset Your BillQuick Information`;

    const message = `Dear valued BillQuick user, we got
        A Request to Reset your information.

        If this wasn't you please reset your password immediately,
        to secure your account from hijackers.`;

    try {
        const { uniqueOTP } = await generateOTP(user);
        const htmlContent = ` ${message}
            Your OTP code is ${uniqueOTP}
            It'll expires in 15 minutes from now.
        `
        await sendEmailFunc(user.email, subject, message, htmlContent)
        return res.status(200).json(
            { email: user.email, message: `code sent to your registered ${to}.` })
    } catch(err) {
        return res.status(500).json("Something went wrong.");
    }
}