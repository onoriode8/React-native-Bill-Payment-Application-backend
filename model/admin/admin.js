import mongoose from 'mongoose'



const adminSchema = new mongoose.Schema({
    role: { type: String, required: true, trim: true }, // admin 
    createdAt: { type: Date, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // i.e => city, state, country.
    adminPassword: { type: String, required: true, trim: true },
    adminID: { type: Number, require: true, unique: true, trim: true },
    adminName: { type: String, required: true, trim: true, unique: true },
    adminEmail: { type: String, required: true, lowercase: true, unique: true, trim: true },
    adminPhoneNumber: { type: Number, required: true, trim: true, unique: true, default: 0 }
})


const adminModel = mongoose.model("admins", adminSchema)



export default adminModel;