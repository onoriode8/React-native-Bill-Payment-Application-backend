import jwt from 'jsonwebtoken'
import axios from 'axios'
import bcryptjs from 'bcryptjs'
import otpGenerator from 'otp-generator'
import { validationResult } from 'express-validator'
import { UAParser } from 'ua-parser-js'
import { startSession } from 'mongoose'

import Users from '../../model/user/user.js'
import NairaWallet from '../../model/user/nairaWallet.js'
import { createPaystackVirtualAccount } from '../../util/paystack.js'
import { alertSecurity, verifyEmailAddress } from '../../util/security.js'


const uaParser = new UAParser()


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
        user = await Users.findOne(email).populate("NairaWallet") //add Promise.all([]) later when username futures is added to create a unique username.
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }

    console.log("USER Line 36", user) //check if the .populate("NairaWallet") is rendered properly.

    const uaString = req.headers['user-agent']
    const parse = uaParser.setUA(uaString).getResult()

    try {
        const isValid = await bcryptjs.compare(password, user.password)
        if(!isValid) return res.status(401).json("Invalid Credentials Entered");
        const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.AccessToken, { expiresIn: "15m" })
        if(!accessToken) return res.status(401).json("Not Authenticated")
        const userEmail = user.email;
        
        const ip = req.headers["x-forwarded-x"].split(",")[0] || req.connection.remoteAddress || req.socket.remoteAddress //to get the ip address of the device.
        const locationData = await axios.post(`https://ipapi.co/${ip}/json/`);
        if(user.loginDetails.ipAddress !== ip) {
            const accessDevice = {
                device: parse.device.type,
                model: parse.device.model,
                version: parse.os.version,
            }
            alertSecurity(locationData, userEmail, accessDevice)
        }
        user.password = undefined;
        user.otp = undefined
        const token = jwt.sign(
            { email: user.email, userId: user._id, role: user.role },
            process.env.AccessToken, { expiresIn: "15m" }) //check whether to increase the time from 15m to 30m
        if(user.isEmailVerified === false) {
            //generate unique 6 digit otp pin.
            const uniqueOTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
            const date = new Date(Date.now() + 15 * 60 * 1000) //15 minutes
            const formattedToString = date.toString()
            const otpExpiresIn = formattedToString.split(" ")[4] //only hrs, mins & secs extracted here
            const hashedUniqueOTP = await bcryptjs.hash(uniqueOTP, 12);
            user.otp = {
                otpCode: hashedUniqueOTP,
                expiresIn: otpExpiresIn
            }
            await user.save()
            await verifyEmailAddress(user.email, user.fullname, uniqueOTP)
            return res.status(200).json(user.isEmailVerified)
        }
        res.status(200).json(user, token)
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
}


export const signup = async (req, res) => {
    const { email, username, password, fullname } = req.body
    const header = req.headers
    // console.log("REACHED", header["x-forwarded-for"])
    const mobileUserAgent = header["x-device-ua"]
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }

    // console.log("MOBILE type", typeof(mobileUserAgent))
    // console.log("MOBILE 1", mobileUserAgent)

    //for Android & IPhone user-agent
    const osName = mobileUserAgent.split(" ")[0] //os => i.e IOS || Android
    const brand = mobileUserAgent.split(" ")[1] //brand => 1.e Apple || Samsung || Nokia || etc. 
    const modelName = `${mobileUserAgent.split(" ")[2]} ${mobileUserAgent.split(" ")[3]} ${mobileUserAgent.split(" ")[4]}`//modelName => 1.e iPhone XS Max || Samsung S 24 Ultra || IPhone x || etc. 
    const osVersion = mobileUserAgent.split(" ")[5] //osVersion => 1.e Apple || Samsung || Nokia || etc. 
    const deviceName = mobileUserAgent.split(" ")[6] //deviceName => 1.e same as brand Apple || Samsung || Nokia || etc. 

    // console.log("LINE 103", `"OS"=>${osName} "brand"=>${brand} "modelName"=>${modelName} "version"=>${osVersion} "deviceName"=>${deviceName}`)
    //for web user-agent
    const uaString = req.headers['user-agent'] 
    const parse = uaParser.setUA(uaString).getResult()

    const Address = "64.145.93.168"
    const ip = req.headers["x-forwarded-x"]?.split(',')[0] || req.connection.remoteAddress || req.socket.remoteAddress 
    const mobileIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress
    const location = await axios.get(`https://ipapi.co/${mobileIp}/json/`);
    let user
    try {
        user = await Users.findOne({ email }) //add Promise.all([]) later when username futures is added to create a unique username.
    } catch (error) {
        return res.status(500).json("Internal Server Error");
    }

    if(user) {
        return res.status(409).json(`User already exist, login instead.`)
    }

    //const { data, customerCode } = createPaystackVirtualAccount(email, fullname) //create an account function

    const userWallet = new NairaWallet({
        balance: 0,
        paystackCustomerCode: 153678, //customerCode, //unique e.g 153678
        paystackVirtualAccount: {
            bankName: "wema-bank", //data.bank.name,
            reference: "unique string", //data.assigned_reference,
            accountName: fullname,
            accountNumber: 9070351944 //data.account_number,
        },
        userId: null
    })
    
    let sess
    try {
        const hashedPassword = await bcryptjs.hash(password, 12)
        //generate unique 6 digit otp pin.
        const uniqueOTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
        const date = new Date(Date.now() + 15 * 60 * 1000) //15 minutes
        const formattedToString = date.toString()
        const otpExpiresIn = formattedToString.split(" ")[4] //only hrs, mins & secs extracted here
    // console.log("REACHED", )

        sess = await startSession()
        sess.startTransaction()
        const hashedUniqueOTP = await bcryptjs.hash(uniqueOTP, 12);
        //dummy data phone number
        const phoneNumber = "09055364280"
        const createdUser = new Users({
            role: "User",
            createdAt: new Date(Date.now()),
            password: hashedPassword,
            isMFA: false,
            username: username, //username later
            fullname: fullname,
            phoneNumber: Number(phoneNumber),
            email: email,
            otp: {
                otpCode: hashedUniqueOTP, //string
                expiresIn: otpExpiresIn
            },
            isEmailVerified: false,
            loginDetails: {
                date: new Date(Date.now()),
                accessDevice: [{
                    device: deviceName ? deviceName : parse.device.type, 
                    model: modelName ? modelName : parse.device.model,
                    version: osVersion ? osVersion : parse.os.version,
                }],
                location: location.data.city + ", " + location.data.region + ". " + location.data.country_name, // i.e => city, state, country.
                ipAddress: location.data.ip,
            },
            nairaWallet: userWallet._id,
            security: null,
            // referra: ,
            beneficiaries: [],
            subscriptionHistory: [],
            fundsWalletTransactionHistory: []
        });
    // console.log("REACHED", )

        const [wallet, savedUser] = await Promise.all(
            [ userWallet.save().session( sess ), createdUser.save().session( sess ) ]) //changed from wallet.save({ session: sess }) to wallet.save().session( sess )

        if(!wallet && !savedUser) {
            return res.status(400).json("Failed to create an account, try again later.")
        }

        wallet.userId = savedUser._id
        await wallet.save().session( sess ); //changed from wallet.save({ session: sess }) to wallet.save().session( sess )
        await sess.commitTransaction()
        await sess.endSession()
    // console.log("REACHED", )

        const token = jwt.sign(
            { email: savedUser.email, id: savedUser._id, role: savedUser.role },
            process.env.AccessToken, { expiresIn: "15m" })
        await verifyEmailAddress(email, fullname, uniqueOTP)

        return res.status(200).json(
            { email: savedUser.email, fullname: savedUser.fullname, userId: savedUser._id, token })
    } catch(err) {
        await sess.abortTransaction()
        return res.status(500).json(err.message) 
    }
}