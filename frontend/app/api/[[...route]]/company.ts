import { Hono } from "hono";
import db from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { checkUser } from "@/lib/checkUser";
import { addCompanySchema, addSelectionSchema } from "@/schemas/add_schema";

const app = new Hono()
  // 企業一覧取得
  .get("/", async (c) => {
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const companies = await db.company.findMany({
      where: {
        userId: user.id,
      },
      include: {
        selections: {
          include: {
            schedules: true,
          },
        },
        urls: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return c.json(companies);
  })

  // 企業追加
  .post("/", zValidator("json", addCompanySchema), async (c) => {
    const data = c.req.valid("json");
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const newCompany = await db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.name,
          note: data.note,
          userId: user.id,
          industry: data.industry,
          logoUrl: data.logoUrl,
        },
      });

      await tx.companyUrl.createMany({
        data: data.urls.map((url) => ({
          ...url,
          companyId: company.id,
        })),
      });

      return company;
    });

    return c.json(newCompany);
  })

  // 企業詳細取得
  .get("/:id", async (c) => {
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.param();
    const company = await db.company.findUnique({
      where: { id, userId: user.id },
      include: {
        urls: true,
        selections: {
          include: {
            schedules: true,
          },
        },
      },
    });

    if (!company) {
      return c.json({ error: "Not Found" }, 404);
    }

    return c.json(company);
  })

  // 企業削除
  .delete("/:id", async (c) => {
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { id } = c.req.param();

    const companyToDelete = await db.company.findUnique({
      where: { id, userId: user.id },
    });

    if (!companyToDelete) {
      return c.json({ error: "Not Found" }, 404);
    }

    const deletedCompany = await db.company.delete({
      where: {
        id,
      },
    });

    return c.json(deletedCompany);
  })

  // 企業更新
  .post("/:id/selection", zValidator("json", addSelectionSchema), async (c) => {
    const data = c.req.valid("json");
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.param();

    const newSelection = await db.$transaction(async (tx) => {
      const selection = await tx.selection.create({
        data: {
          name: data.name,
          type: data.type,
          status: data.status,
          note: data.note,
          companyId: id,
        },
      });
      return selection;
    });

    return c.json(newSelection);
  });

export default app;
