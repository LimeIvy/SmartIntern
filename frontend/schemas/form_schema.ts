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
  isConfirmed: z.boolean(),
  location: z.string().optional(),
  url: z.string().optional(),
  note: z.string().optional(),
});

export const addInterviewSchema = z.object({
  companyName: z.string().min(1, { message: "企業名は必須です。" }),
  companyURL: z.string().url({ message: "無効なURLです" }),
  UserES: z.string().min(1).max(500, { message: "ESは500文字以内で入力してください。" }),
  companyResearch: z.string(),
  Question: z.string(),
});

export const addInterviewAnswerSchema = z.object({
  interviewId: z.string().min(1, { message: "面接IDは必須です。" }),
  question: z.string().min(1, { message: "質問は必須です。" }),
  answer: z.string().min(1, { message: "回答は必須です。" }),
  feedback: z.string().min(1, { message: "フィードバックは必須です。" }),
});
