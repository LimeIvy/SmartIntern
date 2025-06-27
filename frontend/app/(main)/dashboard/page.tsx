"use client";

import { useAtomValue } from "jotai";
import { companiesAtom } from "@/store/companies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Plus,
} from "lucide-react";
import { formattedDate } from "@/utils/formattedDate";

export default function Dashboard() {
  const companiesData = useAtomValue(companiesAtom);
  const companies = companiesData.data ?? [];
  const today = new Date();
  const todayString = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).replace(/\//g, '/').replace(/（/g, '(').replace(/）/g, ')');

  // 今日の予定
  const todaySchedule: {
    companyName: string;
    selectionName: string;
    title: string;
    time: string;
    location?: string;
    url?: string;
    note?: string;
  }[] = [];
  companies.forEach((company) => {
    company.selections?.forEach((selection) => {
      selection.schedules?.forEach((schedule) => {
        const start = schedule.startDate ? new Date(schedule.startDate) : null;
        const end = schedule.endDate ? new Date(schedule.endDate) : null;
        if (
          start && end &&
          today >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
          today <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
        ) {
          todaySchedule.push({
            companyName: company.name,
            selectionName: selection.name,
            title: schedule.title,
            time: `${formattedDate(schedule.startDate ?? "")} ～ ${formattedDate(schedule.endDate ?? "")}`,
            location: schedule.location ?? undefined,
            url: schedule.url ?? undefined,
            note: schedule.note ?? undefined,
          });
        }
      });
    });
  });

  // 直近のタスク（締切7日以内のスケジュール）
  const upcomingTasks: {
    companyName: string;
    selectionName: string;
    title: string;
    daysLeft: number;
    deadline: string;
    location?: string;
    url?: string;
    note?: string;
  }[] = [];
  const now = new Date();
  companies.forEach((company) => {
    company.selections?.forEach((selection) => {
      selection.schedules?.forEach((schedule) => {
        if (!schedule.endDate) return;
        const end = new Date(schedule.endDate);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 7) {
          upcomingTasks.push({
            companyName: company.name,
            selectionName: selection.name,
            title: schedule.title,
            daysLeft: diff,
            deadline: formattedDate(schedule.endDate),
            location: schedule.location ?? undefined,
            url: schedule.url ?? undefined,
            note: schedule.note ?? undefined,
          });
        }
      });
    });
  });
  upcomingTasks.sort((a, b) => a.daysLeft - b.daysLeft);

  if (companiesData.isPending) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">ダッシュボード</h2>
            </div>
          </div>
          <div className="text-center text-gray-500 py-20">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (companiesData.error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">ダッシュボード</h2>
            </div>
          </div>
          <div className="text-center text-red-600 py-20">エラーが発生しました: {companiesData.error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{todayString}</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            企業を登録する
          </Button>
        </div>

        <div>
          {/* 直近のタスク */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CheckSquare className="h-6 w-6 text-green-600" />
              <span className="text-2xl font-bold">直近のタスク (締切7日以内)</span>
            </div>
            {upcomingTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`w-full rounded-2xl border bg-white p-8 shadow-md transition-shadow hover:shadow-lg flex flex-col gap-4 ${task.daysLeft === 0 ? 'border-2 border-red-500 bg-red-50' : task.daysLeft <= 2 ? 'border-2 border-orange-400 bg-orange-50' : ''}`}
                  >
                    {/* 締切バッジ */}
                    {task.daysLeft === 0 && (
                      <div className="text-xl font-extrabold text-red-600 drop-shadow">今日締切</div>
                    )}
                    {task.daysLeft === 1 && (
                      <div className="text-lg font-extrabold text-orange-500 drop-shadow">あと1日</div>
                    )}
                    {task.daysLeft === 2 && (
                      <div className="text-lg font-extrabold text-orange-400 drop-shadow">あと2日</div>
                    )}
                    {/* ヘッダー */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col min-w-0 flex-1">
                        <h3 className="truncate text-2xl font-bold text-gray-900">{task.companyName}</h3>
                        <div className="truncate text-base text-gray-700 font-medium">{task.selectionName}</div>
                      </div>
                    </div>
                    {/* タスク内容 */}
                    <div className="text-lg font-semibold text-blue-700">{task.title}</div>
                    {/* 締切・あと日数 */}
                    <div className="flex items-center gap-3 text-base text-gray-700">
                      <span className="font-medium">締切:</span> {task.deadline}
                      <Badge className={task.daysLeft === 0 ? 'bg-red-100 text-red-800 text-lg px-3 py-1' : task.daysLeft <= 2 ? 'bg-orange-100 text-orange-800 text-lg px-3 py-1' : 'bg-orange-100 text-orange-800'}>
                        あと{task.daysLeft}日
                      </Badge>
                    </div>
                    {/* 場所・リンク・メモ */}
                    {task.location && (
                      <div className="flex items-center gap-2 text-base text-gray-700">
                        <span className="font-medium">場所:</span> {task.location}
                      </div>
                    )}
                    {task.url && (
                      <div className="flex items-center gap-2 text-base">
                        <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">リンク</a>
                      </div>
                    )}
                    {task.note && (
                      <div className="text-base text-gray-500">{task.note}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12 text-lg">直近のタスクはありません。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
