import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";


import User from "../../model/user/user.js";


export const changeAppPassword = async(req, res) => {
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }

}


export const ResetAppPassword = async(req, res) => {
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result.errors) {
            return res.status(422).json(`${error.msg} ${error.path} passed.`)
        }
    }

}