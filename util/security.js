import nodemailer from 'nodemailer'
import speakeasy from 'speakeasy'
import qrCode from 'qrcode'
import bcryptjs from 'bcryptjs'
import otpGenerator from 'otp-generator'

// import Users from '../model/user/user.js'
import sendEmailFunc from './sendingEmail.js'



export const alertSecurity = async (location, userEmail, accessDevice) => {
    console.log("LOCATION", location)
    console.log("USER-EMAIL", userEmail)
    console.log("ACCESS-DEVICE", accessDevice)

    try {
        const subject = `A New Device just got access to your account.`
        const message = `A new device and Ip address just got
         access into your account ${userEmail}, if this wasn't you please 
         secure your account by changing your password.
        `
        const locationInfo = location.data.city + ", " + location.data.region + ". " + location.data.country_name
        const Device = {
            Time: new Date(Date.now()),
            device: accessDevice.device,
            model: accessDevice.model,
            version: accessDevice.version,
            location: locationInfo
        }
        const htmlContent = Device

        await sendEmailFunc(userEmail, subject, message, htmlContent)
    } catch (error) {
        throw new Error(error.message)
    }
}

//show later to user at the top of the dashboard on Frontend UI to enable 2FA for security.
export const twoFactorAuthenticationSecurity = () => {
    //add speakeasy and qrcode to generate unique key word for each user.
}


export const verifyEmailAddress = async (email, fullname, otp) => {

    try {
        const subject = 'Your BillQuick One Time Password (OTP)'
        const message = `
                ${fullname}. 

            Please use the one-time-password (OTP) below.
        
        `
        const htmlContent = `
                ${message}

                ${otp}

            The OTP will expire in 15 minutes.

            Please don't share this OTP with anyone else.
        `
        await sendEmailFunc(email, subject, message, htmlContent)
    } catch (error) {
        throw new Error(error.message)
    }
}


export const generateOTP = async (user) => {
    try {
        const uniqueOTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
        const date = new Date(Date.now() + 15 * 60 * 1000) //15 minutes
        const formattedToString = date.toString()
        const otpExpiresIn = formattedToString.split(" ")[4] //only hrs, mins & secs extracted here
        const hashedUniqueOTP = await bcryptjs.hash(uniqueOTP, 12);
        if(!user) {
            throw new Error("User not found.");
        }
        user.otp = {
            otpCode: hashedUniqueOTP,
            expiresIn: otpExpiresIn
        }
        const savedData = await user.save() //save the data after generated otp
        return { uniqueOTP }
    } catch (error) {
        throw new Error(error.message)
    }
}