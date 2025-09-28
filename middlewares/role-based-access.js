


const roleBasedAccess = (args) => {
    return (req, res, next) => {
        if(args.includes(req.user.role) === false) {
            return res.status(403).json("Forbidden, not allowed.")
        }
        next()
    }
}

export default roleBasedAccess;