import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization!;
  try {
    let data = jwt.verify(header, process.env.JWT_SECRET!);
    req.userId = data.sub as string;
    next();
  } catch (error) {
    return res.status(403).json({
      status: "error",
      message: "Unauthorized",
    });
  }
}
