import mongoose from 'mongoose'



const userWalletTransactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true, trim: true },
    status: { type: String, required: true, trim: true }, //pending | completed | failed
    createdAt: { type: Date, required: true, trim: true }, //date transaction took place
    bank: { type: String, required: true, trim: true, unique: true }, //name of the bank
    accountName: { type: Number, required: true, trim: true }, //account name of holder
    accountNumber: { type: String, required: true, lowercase: true, unique: true, trim: true }, //account number
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
})


const userWalletTransactionModel = mongoose.model("WalletTransaction", userWalletTransactionSchema)



export default userWalletTransactionModel;