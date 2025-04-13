import express from "express";
import isAuthenticated from "../middlewares/isAuth.js";
import { getEmployerJobs, getAllJobs, getJobById, createJob } from "../controllers/job.controller.js";


const router = express.Router();

router.post('/', isAuthenticated, createJob)
router.get('/', isAuthenticated, getAllJobs)
router.get('/employer', isAuthenticated, getEmployerJobs)
router.get('/:id', isAuthenticated, getJobById)

export default router;