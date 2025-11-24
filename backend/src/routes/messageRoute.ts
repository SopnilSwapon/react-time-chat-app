import express from "express";
import { protectRoute } from "../middleware/authMiddleware";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/messageController";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

router.get("/:id", protectRoute, getMessages)

router.post("/send/:id", protectRoute, sendMessage)

export default router;