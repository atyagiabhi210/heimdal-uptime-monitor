import { Router } from "express";
import websites from "./websites.routes";

const router = Router();

router.use("/websites", websites);

export default router;
