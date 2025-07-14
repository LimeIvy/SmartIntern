import { Hono } from "hono";
import db from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { checkUser } from "@/lib/checkUser";
import { storySchema, esStockSchema } from "@/schemas/form_schema";
import { z } from "zod";

const app = new Hono()
  // Story一覧取得
  .get("/story", async (c) => {
    console.log("[API] GET /es - 開始");
    const user = await checkUser();
    if (!user) {
      console.log("[API] GET /es - 未認証");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const stories = await db.story.findMany({
      where: {
        userId: user.id,
      },
      include: {
        esStocks: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("[API] GET /es - 取得したストーリー数:", stories.length);
    console.log("[API] GET /es - ユーザーID:", user.id);
    return c.json(stories);
  })

  // Story追加
  .post("/story", zValidator("json", storySchema), async (c) => {
    const data = c.req.valid("json");
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const newStory = await db.story.create({
      data: {
        title: data.title,
        situation: data.situation,
        task: data.task,
        action: data.action,
        result: data.result,
        learned: data.learned,
        userId: user.id,
      },
    });
    return c.json(newStory);
  })

  // Story更新
  .patch("/story/:id", zValidator("json", storySchema), async (c) => {
    const data = c.req.valid("json");
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.param();

    const newStory = await db.$transaction(async (tx) => {
      const story = await tx.story.update({
        where: {
          id: id,
        },
        data: {
          title: data.title,
          situation: data.situation,
          task: data.task,
          action: data.action,
          result: data.result,
          learned: data.learned,
          userId: user.id,
        },
      });
      return story;
    });

    return c.json(newStory);
  })

  // EsStock一覧取得
  .get("/esStock", async (c) => {
    console.log("[API] GET /es - 開始");
    const user = await checkUser();
    if (!user) {
      console.log("[API] GET /es - 未認証");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const esStocks = await db.esStock.findMany({
      where: {
        userId: user.id,
      },
      include: {
        submittedEs: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("[API] GET /es - 取得したES数:", esStocks.length);
    console.log("[API] GET /es - ユーザーID:", user.id);
    return c.json(esStocks);
  })
  // EsStock追加
  .post("/esStock/:id", zValidator("json", esStockSchema), async (c) => {
    const data = c.req.valid("json");
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.param();

    const selectionExists = await db.selection.findFirst({
      where: {
        id: id,
        company: {
          userId: user.id,
        },
      },
    });

    if (!selectionExists) {
      console.error(
        `ES_ADD_API: Attempt to add esStock to non-existent or unauthorized selection ID: ${id}`
      );
      return c.json({ error: "Selection not found or unauthorized" }, 404);
    }

    const newEsStock = await db.$transaction(async (tx) => {
      const esStock = await tx.esStock.create({
        data: {
          title: data.title,
          content: data.content,
          baseStoryId: data.baseStoryId,
          userId: user.id,
        },
      });
      return esStock;
    });
    return c.json(newEsStock);
  })

  // EsStock更新
  .patch(
    "/esStock/:id",
    zValidator(
      "json",
      z.object({
        title: z.string(),
        content: z.string(),
        baseStoryId: z.string().optional().nullable(),
      })
    ),
    async (c) => {
      const user = await checkUser();
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { id } = c.req.param();
      const { title, content, baseStoryId } = c.req.valid("json");

      // ユーザーがこの選考を所有しているか確認
      const esStockToUpdate = await db.esStock.findFirst({
        where: {
          id: id,
          userId: user.id,
        },
      });

      if (!esStockToUpdate) {
        return c.json({ error: "Not Found or Unauthorized" }, 404);
      }

      const updatedEsStock = await db.esStock.update({
        where: {
          id: id,
        },
        data: {
          title: title,
          content: content,
          baseStoryId: baseStoryId,
        },
      });

      return c.json(updatedEsStock);
    }
  );

export default app;
