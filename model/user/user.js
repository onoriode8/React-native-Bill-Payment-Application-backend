import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    role: { type: String, required: true, trim: true }, // user | admin
    createdAt: { type: Date, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    isMFA: { type: Boolean, required: true },
    isEmailVerified: { type: Boolean, required: true },
    otp: {
        otpCode: { type: String, required: true, trim: true },
        expiresIn: { type: String, required: true, trim: true },
    },
    loginDetails: {
        date: { type: Date, required: true, trim: true },
        location: { type: String, trim: true }, // i.e => city, state, country.
        ipAddress: { type: String, trim: true },
        accessDevice: [{
            device: { type: String, trim: true },
            model: { type: String, trim: true },
            version: { type: String, trim: true }
        }]
    },
    //profileUrl: { type: String, trim: true },
    fullname: { type: String, required: true, trim: true },
    username: { type: String, trim: true }, //add require and unique if you add username on ui later
    email: { type: String, required: true, lowercase: true, unique: true, trim: true },
    phoneNumber: { type: Number, required: true, trim: true, unique: true, default: 0 },
    security: { type: mongoose.Schema.Types.ObjectId, ref: "Security" },
    beneficiaries: [ { type: mongoose.Schema.Types.ObjectId, ref: "Beneficiaries" } ],
    nairaWallet: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "NairaWallet"},
    // referra: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Referra"},
    subscriptionHistory: [ { type: mongoose.Schema.Types.ObjectId, ref: "TransactionHistory" } ],
    fundsWalletTransactionHistory: [ { type: mongoose.Schema.Types.ObjectId, ref: "TransactionHistory" } ]
})


const userModel = mongoose.model("Users", userSchema)



export default userModel;