import { SelectionType, Status } from "@prisma/client";

// 選考タイプの英語と日本語のマッピングオブジェクト
export const selectionTypeToJapanese = {
  [SelectionType.INTERNSHIP]: "インターンシップ",
  [SelectionType.FULLTIME]: "本選考",
};

// ステータスの英語と日本語のマッピングオブジェクト
export const statusToJapanese = {
  [Status.INTERESTED]: "興味あり",
  [Status.APPLIED]: "応募済み",
  [Status.ES_SUBMITTED]: "ES提出済み",
  [Status.WEBTEST]: "Webテスト",
  [Status.INTERVIEW_1]: "一次面接",
  [Status.INTERVIEW_2]: "二次面接",
  [Status.INTERVIEW_3]: "三次面接以降",
  [Status.FINAL]: "最終面接",
  [Status.OFFERED]: "内定",
  [Status.REJECTED]: "お祈り",
};

// 安全に変換するための関数
export function translateSelectionType(type: SelectionType): string {
  return selectionTypeToJapanese[type] || "不明な選考タイプ";
}
export function translateStatus(status: Status): string {
  return statusToJapanese[status] || "不明なステータス";
}
