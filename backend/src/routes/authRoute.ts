import express from "express";
import { login, logout, signup } from "../controllers/authController";

const router = express.Router();

router.post("/sign-up", signup)

router.post("/login", (req, res) =>{
    console.log("hello")
    res.send("login successful")
})

router.post("/logout",logout)


export default router;