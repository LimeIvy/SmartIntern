import { Status } from "@prisma/client";

// 英語のenumと日本語表示のマッピングオブジェクト
export const statusToJapanese = {
  [Status.INTERESTED]: "興味あり",
  [Status.APPLIED]: "応募済み・書類選考中",
  [Status.WEBTEST]: "Webテスト",
  [Status.INTERVIEW_1]: "一次面接",
  [Status.INTERVIEW_2]: "二次面接",
  [Status.INTERVIEW_3]: "三次面接以降",
  [Status.FINAL]: "最終面接",
  [Status.OFFERED]: "内定",
  [Status.REJECTED]: "お祈り",
};

// 安全に変換するための関数
export function translateStatus(status: Status): string {
  return statusToJapanese[status] || "不明なステータス";
}