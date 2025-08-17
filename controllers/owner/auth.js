import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

import OwnerModel from '../../model/owner/ownerModel.js'



export const login = async (req, res) => {
    const { email, username, password } = req.body
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result) {
            console.log("FOR", error)
            return res.status(422).json("Invalid value passed")
        }
    }

    let owner;
    try {
        owner = await OwnerModel.findOne({ ownerEmail: email }) //add Promise.all([]) later when ownername futures is added to create a unique ownername.
        if(!owner) return res.status(404).json("owner not found.")
    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }

    if(owner.role !== "owner") {
        return res.status(401).json("Not allowed to access this route.");
    }

    try {
        const isValid = await bcryptjs.compare(password, owner.password)
        if(!isValid) return res.status(401).json("Invalid Credentials Entered");
        const accessToken = jwt.sign({ email: owner.ownerEmail, id: owner._id }, process.env.AccessToken)
        if(!accessToken) return res.status(401).json("Not Authenticated")
        const ownerEmail = owner.ownerEmail;
        //get the owner location from the frontend to the backend
        //const ip = req.["x-forwarded-x"] //to get the ip address of the device.
        // openCage api to verify the ip address source in milliseconds
        // const locationData = await axios.post(`https://opencage.com/${ip}/${process.env.OPENCAGE_API_KEY}`)
        // console.log("Location", locationData)
        // if(owner.currentLocation !== location) {
            // alertSecurity(location, ownerEmail)
        // }
        owner.password = undefined;
        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60,
            https: false, //change to true on production
            secure: true,

        })
        res.status(200).json(owner)
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
}