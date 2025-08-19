import cors from 'cors'
import 'dotenv/config.js'
import helmet from 'helmet'
import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser';

import ConnectDB from './database.js'
import userRoutes from './routes/user.js'
import adminRoute from './routes/admin.js'
import ownerRoute from './routes/owner.js'


const server = express()

server.use(express.json())

server.use(cookieParser())

// server.use(cors({
//     origin: "*", //[process.env.FRONTEND_URL, "http://192.168.0.171:7070"],
//     credentials: true,
//     // methods: ["GET","POST","PUT","DELETE"],
//     // allowedHeaders: ["Content-Type", "X-Device-UA", "Authorization"],
// }))

server.use(helmet())
server.use(compression())

server.use("/owner", ownerRoute);
server.use("/user", userRoutes)
server.use("/admin", adminRoute)

server.use((req, res) => {
    return res.status(200).json({})
})

server.use((error, req, res, next) => {
    console.log(error)
    return res.status(400).json(error)
})

await ConnectDB()
server.listen(process.env.PORT, () => {
    console.log("Running")
})