import { Router } from "express";

import { login } from '../controllers/owner/auth.js'
import { totalEarnings } from '../controllers/owner/totalEarning.js'

const router = Router()

// owner/ceo/route/alone/login
router.post("/ceo/route/alone/login", login)

router.get("/ceo/route/earnings/:id", totalEarnings)


export default router;