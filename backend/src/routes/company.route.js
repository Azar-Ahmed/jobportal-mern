import express from "express";
import {registerCompany, getCompany, getCompanyById, updateCompany} from '../controllers/company.controller.js'
 import {isAuthenticated} from '../middlewares/isAuth.js'
 import {singleUpload} from '../middlewares/multer.js'

const router = express.Router();

router.post('/register',isAuthenticated, registerCompany)
router.get('/', isAuthenticated,getCompany)
router.get('/:id', isAuthenticated,getCompanyById)
router.put('/update/:id', isAuthenticated,singleUpload, updateCompany)

export default router;