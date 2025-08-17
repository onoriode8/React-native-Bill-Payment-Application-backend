import nodemailer from 'nodemailer'
import speakeasy from 'speakeasy'
import qrCode from 'qrcode'

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
    console.log("DATA", email, fullname, otp)
    try {
        const subject = 'Your BillQuick One Time Password (OTP)'
        const message = `${fullname} Please use the one-time-password (OTP) below.`
        const htmlContent = `${otp}
            The OTP will expire in 15 minutes.
            Please don't share this OTP with anyone else.
        `
        await sendEmailFunc(email, subject, message, htmlContent)
    } catch (error) {
        throw new Error(error)
    }
}