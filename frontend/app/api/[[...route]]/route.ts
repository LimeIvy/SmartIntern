import { Hono } from "hono"
import { handle } from "hono/vercel"

import company from "./company"

const app = new Hono().basePath("/api")
const route = app.route("/company", company)

export type AppType = typeof route

export const GET = handle(route)
export const POST = handle(route)