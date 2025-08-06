import jwt from 'jsonwebtoken'
import axios from 'axios'
import bcryptjs from 'bcryptjs'
import { validationResult } from 'express-validator'

import Users from '../../model/user/user.js'
import NairaWallet from '../../model/user/nairaWallet.js'
import { createPaystackVirtualAccount } from '../../util/paystack.js'
import { alertSecurity } from '../../util/security.js'



export const login = async (req, res) => {
    const { email, username, password } = req.body
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result) {
            console.log("FOR", error)
            return res.status(422).json("Invalid value passed")
        }
    }

    let user;
    try {
        user = await Users.findOne(email) //add Promise.all([]) later when username futures is added to create a unique username.
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }

    try {
        const isValid = await bcryptjs.compare(password, user.password)
        if(!isValid) return res.status(401).json("Invalid Credentials Entered");
        const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.AccessToken, { expiresIn: "15m" })
        if(!accessToken) return res.status(401).json("Not Authenticated")
        const userEmail = user.email;
        //get the user location from the frontend to the backend
        //const ip = req.["x-forwarded-x"] //to get the ip address of the device.
        // openCage api to verify the ip address source in milliseconds
        // const locationData = await axios.post(`https://opencage.com/${ip}/${process.env.OPENCAGE_API_KEY}`)
        // console.log("Location", locationData)
        // if(user.currentLocation !== location) {
            // alertSecurity(location, userEmail)
        // }
        user.password = undefined;
        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60,
            https: false, //change to true on production
            secure: true,

        })
        res.status(200).json(user)
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
}


export const signup = async (req, res) => {
    const { email, username, password, fullname } = req.body
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result) {
            console.log("FOR", error)
            return res.status(422).json("Invalid value passed")
        }
    }

    //get the user location from the frontend
    //const ip = req.["x-forwarded-x"] //to get the ip address of the device.
    // openCage api to verify the ip address source in milliseconds
    // const locationData = await axios.post(`https://opencage.com/${ip}/${process.env.OPENCAGE_API_KEY}`)
    // console.log("Location", locationData)

    try {
        const user = await Users.findOne(email) //add Promise.all([]) later when username futures is added to create a unique username.
        if(user) return res.status(400).json(`User already exist, login instead.`)
    } catch (error) {
        return res.status(500).json("Internal Server Error");
    }

    const { data, customerCode } = createPaystackVirtualAccount(email, fullname) //create an account function

    const userWallet = new NairaWallet({
        balance: 0,
        paystackCustomerCode: customerCode, //unique e.g 153678
        paystackVirtualAccount: {
            bankName: data.bank.name,
            reference: data.assigned_reference,
            accountName: fullname,
            accountNumber: data.account_number,
        },
        userId: null
    })

    try {
        const hashedPassword = await bcryptjs.hash(password, 12)
        
        const createdUser = new Users({
            role: "User",
            createdAt: new Date,
            password: hashedPassword,
            username: "", //username later
            phoneNumber: 0,
            email: email,
            nairaWallet: userWallet._id,
            // referra: ,
            walletTransactionHistory: []
        });

        const [wallet, user ] = await Promise.all([ userWallet.save(), createdUser.save()])
        if(!wallet && !user) {
            return res.status(400).json("Failed to create an account, try again later.")
        }
        wallet.userId = user._id
        await wallet.save();
        user.password = undefined;
        const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.AccessToken, { expiresIn: "15m" })
        if(!accessToken) return res.status(401).json("Not Authenticated");

        // res.cookie("accessToken", accessToken, {
        //     maxAge: 1000 * 60 * 60,
        //     https: false, //change to true on production
        //     secure: true,

        // })
        res.status(200).json("Account created successfully. You can login now and start using your account.") //user
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
}