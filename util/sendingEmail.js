import nodemailer from 'nodemailer'



const sendEmailFunc = async (userEmail, subject, message, htmlContent) => {
    try {

        const transporter = nodemailer.createTransport({
            service: process.env.GOGGLE_SERVICE, 
            auth: {
                user: process.env.GOGGLE_USER, 
                pass: process.env.GOGGLE_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.GOGGLE_USER,
            to: `${userEmail}`,
            subject: subject,
            text: message,
            html: `<b>${htmlContent}</b>`
        };

        const info = await transporter.sendMail(mailOptions)
    } catch (error) {
        throw new Error(error.message)
    }
}

export default sendEmailFunc;