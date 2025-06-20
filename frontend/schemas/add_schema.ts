import { z } from "zod";

export const addCompanySchema = z.object({
  name: z.string().min(1, { message: "企業名は必須です" }),
  industry: z.string().optional(),
  logoUrl: z.string().url({ message: "無効なURLです" }).optional().or(z.literal("")),
  hpUrl: z.string().url({ message: "無効なURLです" }).optional().or(z.literal("")),
  mypageUrl: z.string().url({ message: "無効なURLです" }).optional().or(z.literal("")),
  note: z.string().optional(),
}); 

export const addSelectionSchema = z.object({
  name: z.string().min(1, { message: "選考名は必須です。" }),
  type: z.enum(["INTERNSHIP", "FULLTIME"]),
  status: z.enum(["INTERESTED", "APPLIED", "ES_SUBMITTED", "WEBTEST", "INTERVIEW_1", "INTERVIEW_2", "INTERVIEW_3", "FINAL", "OFFERED", "REJECTED"]),
  note: z.string().optional(),
});

export const addScheduleSchema = z.object({
  title: z.string().min(1, { message: "スケジュールタイトルは必須です。" }),
  startDate: z.string().min(1, { message: "開始日は必須です。" }),
  endDate: z.string().min(1, { message: "終了日は必須です。" }),
  startTime: z.string().min(1, { message: "開始時刻は必須です。" }),
  endTime: z.string().min(1, { message: "終了時刻は必須です。" }),
  isConfirmed: z.boolean().optional(),
  location: z.string().optional(),
  url: z.string().optional(),
  note: z.string().optional(),
});