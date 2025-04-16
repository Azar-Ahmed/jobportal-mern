import express from "express";
import {isAuthenticated} from "../middlewares/isAuth.js";
import { getEmployerJobs, getAllJobs, getJobById, createJob } from "../controllers/job.controller.js";


const router = express.Router();

router.post('/post', isAuthenticated, createJob)
router.get('/get', isAuthenticated, getAllJobs)
router.get('/getadminjobs', isAuthenticated, getEmployerJobs)
router.get('/get/:id', isAuthenticated, getJobById)

export default router;