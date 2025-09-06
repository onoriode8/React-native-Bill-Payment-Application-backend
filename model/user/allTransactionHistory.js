import mongoose from "mongoose";



const allTransactionHistorySchema = new mongoose.Schema({
    productName: { type: String },
    networkType: { type: String },

    senderName: { type: String },
    senderBank: { type: String },
    senderAccountNumber: { type: Number },
    
    recipientName: { type: String },
    recipientBank: { type: String },
    recipientAccountNumber: { type: Number },

    date: { type: Date, required: true, trim: true },
    amount: { type: Number, required: true, trim: true },

    //add other object later for all transaction history.
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" }
})

const allTransactionHistoryModel = mongoose.model("AllTransactionHistory", allTransactionHistorySchema);


export default allTransactionHistoryModel;