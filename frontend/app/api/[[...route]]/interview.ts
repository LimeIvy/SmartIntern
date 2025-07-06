import { Hono } from "hono";
import db from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { checkUser } from "@/lib/checkUser";
import { addInterviewSchema } from "@/schemas/form_schema";
import { v4 as uuidv4 } from 'uuid';

const app = new Hono()
  // インタビュー一覧取得
  .get("/", async (c) => {
    console.log("[API] GET /interview - 開始");
    const user = await checkUser();
    if (!user) {
      console.log("[API] GET /interview - 未認証");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const interviews = await db.interview.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("[API] GET /interview - 取得したインタビュー数:", interviews.length);
    console.log("[API] GET /interview - ユーザーID:", user.id);
    return c.json(interviews);
  })

  // インタビュー追加
  .post("/", zValidator("json", addInterviewSchema), async (c) => {
    const data = c.req.valid("json");
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const newInterview = await db.interview.create({
      data: {
        interviewId: uuidv4(),
        companyName: data.companyName,
        companyURL: data.companyURL,
        companyResearch: data.companyResearch,
        UserES: data.UserES,
        Question: data.Question,
        userId: user?.id ?? "",
        createdAt: new Date(),
      },
    });
    return c.json({ interviewId: newInterview.interviewId });
  })

  .get("/:interviewId", async (c) => {
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { interviewId } = c.req.param();
    const interview = await db.interview.findFirst({
      where: { interviewId: interviewId },
    });
    console.log(interview);
    if (!interview) {
      return c.json({ error: "Not Found" }, 404);
    }
    return c.json(interview);
  })

export default app;
