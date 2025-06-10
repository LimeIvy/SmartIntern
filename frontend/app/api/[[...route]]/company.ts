import { Hono } from "hono";
import db from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { checkUser } from "@/lib/checkUser";
import { addCompanySchema } from "@/app/schemas/add_company_schema";

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
        selections: true,
      },
    });

    if (!company) {
      return c.json({ error: "Not Found" }, 404);
    }

    return c.json(company);
  })

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
