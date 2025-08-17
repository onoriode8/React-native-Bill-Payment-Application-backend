import bcryptjs from 'bcryptjs'
import { validationResult } from 'express-validator'

import Users from '../../model/user/user.js'



export const verifyEmailByOTP = async (req, res) => {
    const otpCode = req.body.otp
    const userId = req.params.id;
    const result = validationResult(req)
    console.log("OTP", otpCode)
    console.log("PARAMS - USER-ID", userId)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }

    try {
        const user = await Users.findById(req.user.userId)
        if(!user) return res.status(404).json("User not found")
console.log("OTP FROM SERVER", user.otp)

        if(userId !== req.user.userId) {
            return res.status(401).json("Not allowed.")
        }
        const codeDateSent = new Date(Date.now()).toString().split(" ")[4];
        if(codeDateSent > user.otp.expiresIn) {
            return res.status(419).json("Code Expired, login to continue.")
        }
        const isValid = await bcryptjs.compare(Number(otpCode), user.otp.otpCode) //convert to number.
        if(!isValid) return res.status(422).json("Invalid code entered.");

        user.isEmailVerified = true
        await user.save()
        return res.status(200).json("Email verified, Login to use the app.")
    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }
}