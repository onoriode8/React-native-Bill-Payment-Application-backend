


const roleBasedAccess = (args) => {
    return (req, res, next) => {
        console.log("ROLE", args)
        console.log(typeof args.includes(req.user.role))
        if(args.includes(req.user.role) === false) {
            console.log("CHECK", args.includes(req.user.role))
            return res.status(403).json("Forbidden, not allowed.")
        }
        next()
    }
}

export default roleBasedAccess;