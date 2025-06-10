import { Hono } from "hono";
import db from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { checkUser } from "@/lib/checkUser";
import { addCompanySchema } from "@/app/schemas/add_campany_schema";

const app = new Hono()
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
        selections: true,
        urls: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return c.json(companies);
  })

  .post("/", zValidator("form", addCompanySchema), async (c) => {
    const data = c.req.valid("form");
    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const company = await db.company.create({
      data: {
        name: data.name,
        urls: {
          create: {
            type: "official",
            url: data.url,
          },
        },
        note: data.note,
        userId: user.id,
      },
    });

    return c.json(company);
  })

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
  });

export default app;
