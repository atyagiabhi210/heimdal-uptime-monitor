import { Router } from "express";
import { prisma } from "store/client";
import { authMiddleware } from "../../middleware";

const router = Router();

router.post("/create", authMiddleware, async (req, res) => {
  if (!req.body.url) {
    return res.status(411).json({
      status: "error",
      message: "URL is required",
    });
  }
  if (!req.userId) {
    return res.status(403).json({
      status: "error",
      message: "Unauthorized",
    });
  }
  const website = await prisma.website.create({
    data: {
      url: req.body.url,
      timeAdded: new Date(),
      user: {
        connect: {
          id: req.userId,
        },
      },
    },
  });
  res.json({
    status: "ok",
    data: {
      websiteId: website.id,
    },
  });
});

router.get("/status/:websiteId", authMiddleware, async (req, res) => {
  // we first need to get the website from the database
  // but also find the ticks for the website

  try {
    let website = await prisma.website.findFirst({
      where: {
        user_id: req.userId!,
        id: req.params.websiteId as string,
      },
      include: {
        ticks: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });
    if (!website) {
      return res.status(409).json({
        status: "error",
        message: "Website not found",
      });
    }
    return res.status(200).json({
      status: "ok",
      data: {
        websiteId: website.id,
        status: website.ticks[0].status,
        responseTime: website.ticks[0].response_time_ms,
        lastChecked: website.ticks[0].createdAt,
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
