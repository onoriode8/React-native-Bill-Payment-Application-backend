import bcrypt from "bcrypt";
import { validationResult } from "express-validator";


import sendEmailFunc  from '../../util/sendingEmail.js'
import { fetchUserDataHelper } from '../../util/helper-func.js'



export const changeAppPassword = async(req, res) => {
    const userId = req.params.userId;
    const { oldAppPassword, newAppPassword, confirmedAppPassword } = req.body; //string
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(
                `${error.msg} password passed, password must be 8 or more character long.`)
        }
    }

    if(newAppPassword !== confirmedAppPassword) {
        return res.status(422).json("Password must match.")
    }

    if(oldAppPassword.trim().length < 8
        && newAppPassword.trim().length < 8 &&
        confirmedAppPassword.trim().length < 8
    ) {
        return res.status(422).json("Password must be 8 or more character long.");
    }

    const { user } = await fetchUserDataHelper(req.user.userId, userId)

    let hashedAppPassword;
    try {
        hashedAppPassword = await bcrypt.compare(oldAppPassword, user.password);
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }

    if(!hashedAppPassword) {
        return res.status(422).json({ message: `Incorrect existing password entered.` });
    }

    const subject = `Your BillQuick Password Was Changed`;

    const message = `Dear valued BillQuick user,
        your password was changed.

        If this wasn't you please reset your password immediately,
        to secure your account from hijackers.`;

    const htmlContent = ` ${message} `

    try {
        const hashedNewAppPassword = await bcrypt.hash(newAppPassword, 12);
        user.password = hashedNewAppPassword;
        await user.save()
        await sendEmailFunc(user.email, subject, message, htmlContent); //added bullMQ || Redis for sending emails.
        return res.status(200).json("Password updated.")
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }

}


export const ResetAppPassword = async(req, res) => {
    const userId = req.params.userId;
    const { newAppPassword, confirmedAppPassword } = req.body; //string
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(
                `${error.msg} password passed, password must be 8 or more character long.`);
        }
    }

    if(newAppPassword !== confirmedAppPassword) {
        return res.status(422).json("Password must match.")
    }

    const { user } = await fetchUserDataHelper(req.user.userId, userId)

    const subject = `Your BillQuick Password Was Reset`;

    const message = `Dear valued BillQuick user,
        your password was Reset.

        If this wasn't you please reset your password immediately,
        to secure your account from hijackers.`;

    const htmlContent = ` ${message} `

    try {
        const hashedNewAppPassword = await bcrypt.hash(newAppPassword, 12);
        user.password = hashedNewAppPassword;
        await user.save()
        await sendEmailFunc(user.email, subject, message, htmlContent); //added bullMQ || Redis for sending emails.
        return res.status(200).json("Password updated.")
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }
}