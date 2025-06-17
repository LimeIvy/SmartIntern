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

export const addSelectionSchema = z.object({
  name: z.string().min(1, { message: "選考名は必須です。" }),
  type: z.enum(["INTERNSHIP", "FULLTIME"]),
  status: z.enum(["INTERESTED", "APPLIED", "ES_SUBMITTED", "WEBTEST", "INTERVIEW_1", "INTERVIEW_2", "INTERVIEW_3", "FINAL", "OFFERED", "REJECTED"]),
  note: z.string().optional(),
});