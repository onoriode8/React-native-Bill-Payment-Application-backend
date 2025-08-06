import nodemailer from 'nodemailer'
import speakeasy from 'speakeasy'
import qrCode from 'qrcode'



export const alertSecurity = async (location, userEmail) => {
    try {
        const transport = nodemailer.createTransport({
            to: userEmail,
            from: "",
            subject: "",
            text: {
                message: "",
                loginLocation: location,
                date: new Date().toDateString()
            }
        })
        // transport.mailOption()
        const mail = await transport.sendMail(mailOption)
    } catch (error) {
        throw new Error(error.message)
    }
}

//show later to user at the top of the dashboard on Frontend UI to enable 2FA for security.
export const twoFactorAuthenticationSecurity = () => {
    //add speakeasy and qrcode to generate unique key word for each user.
}