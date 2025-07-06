import { Hono } from "hono";
import { handle } from "hono/vercel";

import company from "./company";
import interview from "./interview";

const app = new Hono().basePath("/api");
const route = app.route("/company", company).route("/interview", interview);

export type AppType = typeof route;

export const GET = handle(route);
export const POST = handle(route);
export const DELETE = handle(route);
export const PATCH = handle(route);
