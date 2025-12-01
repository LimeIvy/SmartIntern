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
  category: z.string().min(1, { message: "カテゴリは必須です。" }),
  question: z.string().min(1, { message: "質問は必須です。" }),
  answer: z.string().min(1, { message: "回答は必須です。" }),
  totalScore: z.number().min(0, { message: "合計点数は0以上です。" }),
  specificityScore: z.number().min(0, { message: "具体性は0以上です。" }),
  logicScore: z.number().min(0, { message: "論理性は0以上です。" }),
  starStructureScore: z.number().min(0, { message: "STAR形式構造は0以上です。" }),
  companyFitScore: z.number().min(0, { message: "企業適合性は0以上です。" }),
  growthScore: z.number().min(0, { message: "成長性は0以上です。" }),
  feedback: z.string().min(1, { message: "フィードバックは必須です。" }),
  followUpQuestion: z.string().optional(),
});

export const storySchema = z.object({
  title: z.string().min(1, 'タイトルは必須です。'),
  situation: z.string().min(1, '状況は必須です。'),
  task: z.string().min(1, '課題・目標は必須です。'),
  action: z.string().min(1, '行動は必須です。'),
  result: z.string().min(1, '結果は必須です。'),
  learned: z.string().optional(),
})
export type StoryFormValues = z.infer<typeof storySchema>

export const esStockSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です。'),
  content: z.string().min(1, '内容は必須です。'),
  baseStoryId: z.string().optional().nullable(),
})
export type EsStockFormValues = z.infer<typeof esStockSchema>