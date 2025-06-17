import { z } from "zod";

export const addCompanySchema = z.object({
  name: z.string().min(1, { message: "企業名は必須です。" }),
  urls: z
    .array(
      z.object({
        type: z.string().min(1, { message: "URLタイプは必須です。" }),
        url: z.string().url({ message: "有効なURLを入力してください。" }),
      })
    )
    .min(0),
  note: z.string().optional(),
  industry: z.string().optional(),
  logoUrl: z.string().optional(),
}); 