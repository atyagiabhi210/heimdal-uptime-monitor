import { Router } from "express";
import { prisma } from "store/client";

const router = Router();

router.post("/website", async (req, res) => {
  if (!req.body.url) {
    return res.status(411).json({
      status: "error",
      message: "URL is required",
    });
  }
  const website = await prisma.website.create({
    data: {
      url: req.body.url,
      timeAdded: new Date(),
    },
  });
  res.json({
    status: "ok",
    data: {
      websiteId: website.id,
    },
  });
});

router.get("/status/:websiteId", (req, res) => {
  res.json({
    status: "ok",
    data: {
      websiteId: req.params.websiteId,
      status: "ok",
    },
  });
});

export default router;
