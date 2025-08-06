import mongoose from 'mongoose'



const ownerSchema = new mongoose.Schema({
    role: { type: String, required: true, trim: true }, //owner
    createdAt: { type: Date, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // i.e => city, state, country.
    ownerPassword: { type: String, required: true, trim: true },
    totalEarnings: { type: Number, required: true, trim: true },
    ownerID: { type: Number, require: true, unique: true, trim: true },
    ownerName: { type: String, required: true, trim: true, unique: true },
    ownerEmail: { type: String, required: true, lowercase: true, unique: true, trim: true },
    ownerPhoneNumber: { type: Number, required: true, trim: true, unique: true, default: 0 }
})


const ownerModel = mongoose.model("Owner", ownerSchema)



export default ownerModel;