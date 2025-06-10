import { Hono } from "hono"
import db from "@/lib/prisma"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { checkUser } from "@/lib/checkUser"

export const schema = z.object({
  name: z.string().min(1, "Please write something."),
  url: z.string().min(1, "Please write something."),
  note: z.string().min(1, "Please write something.")
})

const app = new Hono()
  .get("/", async (c) => {
    const user = await checkUser()
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const companies = await db.company.findMany({
      where: {
        userId: user.id,
      },
    })

    return c.json(companies)
  })

  .post("/", zValidator("form", schema), async (c) => {
    const data = c.req.valid("form")
    const user = await checkUser()
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const company = await db
      .company.create({
        data: {
          name: data.name,
          url: data.url,
          note: data.note,
          userId: user.id,
        },
      })

    return c.json(company)
  })

export default app
