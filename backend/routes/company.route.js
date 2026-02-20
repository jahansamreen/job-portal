import express from "express";
import {registerCompany,getCompany, getCompanyById, updateCompany} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js"
const router = express.Router();

router.route("/register").post(isAuthenticated, registerCompany);
router.route("/update/:id").post(isAuthenticated, updateCompany);
router.route("/get/:id").post(isAuthenticated,getCompanyById);
router.route('/get').get(isAuthenticated, getCompany);

export default router;