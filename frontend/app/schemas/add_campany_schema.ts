import { z } from "zod";

export const addCompanySchema = z.object({
  name: z.string().min(1, "Please write something."),
  url: z.string().min(1, "Please write something."),
  note: z.string().min(1, "Please write something."),
});
