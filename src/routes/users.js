import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", authenticate, getUsers);
router.post("/", authenticate, createUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
