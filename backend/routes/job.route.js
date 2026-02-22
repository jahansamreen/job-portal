import express from "express";
import {postjob,getAdminJobs, getJobById, getAllJobs} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js"
const router = express.Router();

router.route("/post").post(isAuthenticated, postjob);
router.route("/getAdminJobs").put(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated,getJobById);
router.route('/get').get(isAuthenticated, getAllJobs);

export default router;