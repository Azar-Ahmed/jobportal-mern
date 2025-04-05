import express from "express";
import {register, login, logout, updateProfile} from '../controllers/user.controller.js'
 import {isAuthenticated} from '../middlewares/isAuth.js'
 import {singleUpload} from '../middlewares/multer.js'
const router = express.Router();

router.post('/register',singleUpload, register)
router.post('/login', login)
router.get('/logout', logout)
router.put('/profile/update', isAuthenticated, singleUpload, updateProfile)

export default router;