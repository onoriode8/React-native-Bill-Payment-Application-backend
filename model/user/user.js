import mongoose from 'mongoose'



const userSchema = new mongoose.Schema({
    role: { type: String, required: true, trim: true }, // user | admin
    createdAt: { type: Date, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // i.e => city, state, country.
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, lowercase: true, unique: true, trim: true },
    phoneNumber: { type: Number, required: true, trim: true, unique: true, default: 0 },
    nairaWallet: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "NairaWallet"},
    // referra: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Referra"},
    walletTransactionHistory: [ { type: mongoose.Schema.Types.ObjectId, ref: "TransactionHistory" } ]
})


const userModel = mongoose.model("Users", userSchema)



export default userModel;