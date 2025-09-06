import axios from 'axios'
import mongoose from 'mongoose'
import { validationResult } from 'express-validator';


import Users from "../../model/user/user.js";
import { withdrawFundsFromVirtualAccount } from "../../util/paystack.js";
import UserWalletTransaction from "../../model/user/walletTransaction.js";
import AllTransactionHistory from "../../model/user/allTransactionHistory.js";



export const transfer = async (req, res) => {
    const { amount, recipientBank, recipientName,
        recipientAccountNumber } = req.body
    const userId = req.params.id;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed`);
        }
    }

    if(typeof(amount) !== "number" || typeof recipientAccountNumber !== "number") {
        return res.status(403).json("Value must be a number.")
    };

    console.log("REACH 1")

    if(!req.user.userId && req.user.role !== "User") {
        return res.status(400).json("Not allowed.");
    }

    let user;
    try {
        user = await Users.findById(req.user.userId)
            .populate("nairawallet")
            .populate("allTransactionHistory")
            .populate("fundsWalletTransactionHistory");
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.");
    }

    if(user._id.toString() !== userId) {
        return res.status(401).json("Access denied.");
    }

    console.log("user", user);

    let session;
    try {
        session = await mongoose.startSession()
        await session.startTransaction()
        //const {} = withdrawFundsFromVirtualAccount(amount, recipientBank, recipientName, recipientAccountNumber);
        const createdTransaction = new AllTransactionHistory({
            amount: amount,
            recipientBank,
            recipientName,
            recipientAccountNumber,
            date: new Date(Date.now()),
            userId: user._id
        })

        const walletTransaction = new UserWalletTransaction({
            amount: amount,
            status: "completed", //pending | completed | failed
            createdAt: new Date(Date.now()),
            recipientBank,
            recipientName,
            recipientAccountNumber,
            creatorId: user._id 
        })
        const [allHistory, walletHistory] = await Promise.all([
            createdTransaction.save({ session }), 
            walletTransaction.save({ session }) 
        ]);
        console.log("All", allHistory)
        console.log("Wallet", walletHistory)
        user.allTransactionHistory.push(allHistory)
        user.fundsWalletTransactionHistory.push(walletHistory)
        await user.save({ session });
        await session.commitTransaction()
        await session.endSession()
        return res.status(200).json("Tranfer sent to beneficiary account.")
   } catch (error) {
        await session.abortTransaction()
        await session.endSession()
        console.log("ERROR MESSAGE", error.message)
        return res.status(500).json("Something went wrong. Try again.")
   }
}

export const getRecipientBankDetails = async (req, res) => {
    const { recipientAccountNumber, recipientBank } = req.body
    const userId = req.params.id;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed`);
        }
    }

    if(typeof recipientAccountNumber !== "number") {
        return res.status(403).json("Value must be a number.")
    };

    if(!req.user.userId && req.user.role !== "User") {
        return res.status(400).json("Not allowed.");
    }

    let user;
    try {
        user = await Users.findById(req.user.userId)
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.");
    }

    if(user._id.toString() !== userId) {
        return res.status(401).json("Access denied.");
    }

    //get user bank details from the bank API 
    //const response = await axios.get(``);
}

export const getBillQuickUser = async (req, res) => {
    const { recipientAccountNumber, recipientBank } = req.body
    const userId = req.params.id;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed`);
        }
    }

    if(typeof recipientAccountNumber !== "number") {
        return res.status(403).json("Value must be a number.")
    };

    if(!req.user.userId && req.user.role !== "User") {
        return res.status(400).json("Not allowed.");
    }

    let user;
    try {
        user = await Users.findById(req.user.userId)
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.");
    }

    if(user._id.toString() !== userId) {
        return res.status(401).json("Access denied.");
    }

    //get user bank details from the bank API 
    //const response = await axios.get(``);
}


export const transferToBillQuickUser = async(req, res) => {
    const { amount, recipientBank, recipientName,
        recipientAccountNumber } = req.body
    const userId = req.params.id;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed`);
        }
    }

    if(typeof(amount) !== "number" || typeof recipientAccountNumber !== "number") {
        return res.status(403).json("Value must be a number.")
    };

    console.log("REACH 1")

    if(!req.user.userId && req.user.role !== "User") {
        return res.status(400).json("Not allowed.");
    }

    let user;
    try {
        user = await Users.findById(req.user.userId)
            .populate("nairawallet")
            .populate("allTransactionHistory")
            .populate("fundsWalletTransactionHistory");
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.");
    }

    if(user._id.toString() !== userId) {
        return res.status(401).json("Access denied.");
    }

    try {
        //withdraw the funds first from the user balance and credit to the recipient bank account

        //const {} = withdrawFundsFromVirtualAccount(amount, recipientBank, recipientName, recipientAccountNumber);
    } catch (err) {
        return res.status(500).json("Something went wrong, try again later.");
    }
}