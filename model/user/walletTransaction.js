import mongoose from 'mongoose'



const userWalletTransactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true, trim: true },
    recipientBank: { type: String, required: true, trim: true },
    recipientName: { type: String, required: true, trim: true },
    recipientAccountNumber: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true }, //pending | completed | failed
    createdAt: { type: Date, required: true, trim: true }, //date transaction took place
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
})


const userWalletTransactionModel = mongoose.model("FundsWalletTransactionHistory", userWalletTransactionSchema)



export default userWalletTransactionModel;