import { Router, type Request, type Response } from "express";
import { AuthInput } from "../../types";
import { prisma } from "store/client";
import jwt from "jsonwebtoken";
import "dotenv/config";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const data = AuthInput.safeParse(req.body);
    if (!data.success) {
      return res.status(403).json({
        status: "error",
        message: data.error.message,
      });
    }
    let user = await prisma.user.create({
      data: {
        email: data.data.email,
        userName: data.data.username,
      },
    });
    let token = jwt.sign(
      {
        sub: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "6h",
      },
    );
    return res.status(200).json({
      status: "ok",
      data: {
        userId: user.id,
        token: token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error," + error,
    });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const data = AuthInput.safeParse(req.body);
    if (!data.success) {
      return res.status(403).json({
        status: "error",
        message: data.error.message,
      });
    }
    let user = await prisma.user.findFirst({
      where: {
        email: data.data.email,
      },
    });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    let token = jwt.sign(
      {
        sub: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "6h",
      },
    );

    return res.status(200).json({
      status: "ok",
      data: {
        userId: user.id,
        token: token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

export default router;
