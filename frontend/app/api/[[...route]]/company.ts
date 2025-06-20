import { Hono } from "hono";
import db from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { checkUser } from "@/lib/checkUser";
import { addCompanySchema, addSelectionSchema, addScheduleSchema } from "@/schemas/add_schema";

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

    const newCompany = await db.company.create({
      data: {
        name: data.name,
        note: data.note,
        userId: user.id,
        industry: data.industry,
        logoUrl: data.logoUrl,
        hpUrl: data.hpUrl,
        mypageUrl: data.mypageUrl,
      },
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
  })

  // 選考スケジュール追加
  .post("/:id/schedule", zValidator("json", addScheduleSchema), async (c) => {
    const data = c.req.valid("json");
    console.log("SCHEDULE_ADD_API: Received data:", data);

    const user = await checkUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id } = c.req.param();
    console.log("SCHEDULE_ADD_API: Received selectionId from param:", id);

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
        `SCHEDULE_ADD_API: Attempt to add schedule to non-existent or unauthorized selection ID: ${id}`
      );
      return c.json({ error: "Selection not found or unauthorized" }, 404);
    }

    const newSchedule = await db.$transaction(async (tx) => {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      const schedule = await tx.schedule.create({
        data: {
          title: data.title,
          startDate: startDateTime,
          endDate: endDateTime,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          url: data.url,
          note: data.note,
          isConfirmed: data.isConfirmed,
          selectionId: id,
        },
      });
      return schedule;
    });
    return c.json(newSchedule);
  });

export default app;
