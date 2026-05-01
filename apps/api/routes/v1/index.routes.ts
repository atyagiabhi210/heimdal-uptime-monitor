import { Router } from "express";
import websites from "./websites.routes";
import usersRoutes from "./users.routes";
const router = Router();

router.use("/websites", websites);
router.use("/users", usersRoutes);

export default router;
