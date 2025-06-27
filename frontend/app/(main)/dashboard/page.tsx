"use client";

import { useAtomValue } from "jotai";
import { useState } from 'react';
import { companiesAtom } from "@/store/companies";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Plus,
  CalendarClock,
  Briefcase,
  ExternalLink,
  MapPin,
  FileText,
} from "lucide-react";
import { formattedDate } from "@/utils/formattedDate";
import { translateStatus } from "@/utils/statusTranslator";
import Link from "next/link";
import { Status, SelectionType } from "@prisma/client";
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | SelectionType>('ALL');
  const companiesData = useAtomValue(companiesAtom);
  const companies = companiesData.data ?? [];
  const today = new Date();
  const todayString = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).replace(/\//g, '/').replace(/（/g, '(').replace(/）/g, ')');

  // 選考タイプで企業情報をフィルタリング
  const filteredCompanies = filter === 'ALL'
    ? companies
    : companies
        .map(company => ({
          ...company,
          selections: company.selections?.filter(selection => selection.type === filter),
        }))
        .filter(company => company.selections && company.selections.length > 0);

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
  filteredCompanies.forEach((company) => {
    company.selections?.forEach((selection) => {
      selection.schedules?.forEach((schedule) => {
        const start = schedule.startDate ? new Date(schedule.startDate) : null;
        if (
          start &&
          start.getFullYear() === today.getFullYear() &&
          start.getMonth() === today.getMonth() &&
          start.getDate() === today.getDate()
        ) {
          todaySchedule.push({
            companyName: company.name,
            selectionName: selection.name,
            title: schedule.title,
            time: `${formattedDate(schedule.startDate ?? "", "time")} ～ ${formattedDate(schedule.endDate ?? "", "time")}`,
            location: schedule.location ?? undefined,
            url: schedule.url ?? undefined,
            note: schedule.note ?? undefined,
          });
        }
      });
    });
  });
  todaySchedule.sort((a, b) => a.time.localeCompare(b.time));


  // 直近のタスク（締切7日以内のスケジュール）
  const upcomingTasks: {
    companyId: string;
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
  filteredCompanies.forEach((company) => {
    company.selections?.forEach((selection) => {
      selection.schedules?.forEach((schedule) => {
        if (!schedule.endDate) return;
        const end = new Date(schedule.endDate);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 7) {
          upcomingTasks.push({
            companyId: company.id,
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

  // 選考ステータスごとの集計
  const statusCounts = filteredCompanies.reduce((acc, company) => {
    company.selections?.forEach(selection => {
      if (selection.status) {
        acc[selection.status] = (acc[selection.status] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<Status, number>);

  const statusOrder: Status[] = [
    Status.APPLIED,
    Status.ES_SUBMITTED,
    Status.WEBTEST,
    Status.INTERVIEW_1,
    Status.INTERVIEW_2,
    Status.INTERVIEW_3,
    Status.FINAL,
    Status.OFFERED,
    Status.REJECTED,
  ];

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

  // データが空の場合の表示 (Empty State)
  if (companies.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8 text-center flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ようこそ！</h2>
          <p className="text-gray-600 mb-8">さあ、就職活動の管理を始めましょう。</p>
          <Link href="/companies">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              まずは企業を登録する
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-3xl font-bold text-gray-900">{todayString}</p>
          <div className="flex items-center gap-2 rounded-lg bg-gray-200 p-1">
            <Button
              onClick={() => setFilter('ALL')}
              variant={filter === 'ALL' ? 'default' : 'ghost'}
              className="transition-all"
            >
              すべて
            </Button>
            <Button
              onClick={() => setFilter(SelectionType.INTERNSHIP)}
              variant={filter === SelectionType.INTERNSHIP ? 'default' : 'ghost'}
              className="transition-all"
            >
              インターン
            </Button>
            <Button
              onClick={() => setFilter(SelectionType.FULLTIME)}
              variant={filter === SelectionType.FULLTIME ? 'default' : 'ghost'}
              className="transition-all"
            >
              本選考
            </Button>
          </div>
        </div>

        {/* 上段：今日の予定 & 選考状況サマリ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 今日の予定 */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CalendarClock className="h-6 w-6 text-blue-600" />
              <span className="text-2xl font-bold">今日の予定</span>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((schedule, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-bold text-lg">{schedule.title}</p>
                    <p className="text-sm text-gray-600">{schedule.companyName} / {schedule.selectionName}</p>
                    <p className="font-semibold text-blue-700">{schedule.time}</p>
                    {schedule.location && <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {schedule.location}</p>}
                    {schedule.url && <a href={schedule.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ExternalLink size={14} /> オンラインリンク</a>}
                    {schedule.note && <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><FileText size={14} /> {schedule.note}</p>}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-12 text-lg">今日の予定はありません。</div>
              )}
            </div>
          </div>
          {/* 選考状況サマリ */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <span className="text-2xl font-bold">選考状況サマリ</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {statusOrder.map(status => (
                statusCounts[status] > 0 && (
                  <Link href="/kanban" key={status}>
                    <div className="bg-white p-4 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
                      <p className="text-3xl font-bold text-purple-700">{statusCounts[status]}</p>
                      <p className="text-sm font-medium text-gray-600">{translateStatus(status)}</p>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>

        {/* 下段：直近のタスク */}
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
                  onClick={() => router.push(`/companies/${task.companyId}`)}
                  className={`h-full w-full rounded-2xl border bg-white p-8 shadow-md transition-shadow hover:shadow-lg flex flex-col gap-4 cursor-pointer ${task.daysLeft === 0 ? 'border-2 border-red-500 bg-red-50' : task.daysLeft <= 2 ? 'border-2 border-orange-400 bg-orange-50' : ''}`}
                >
                  {/* 締切バッジ */}
                  <div className="flex justify-between items-start">
                    {task.daysLeft === 0 && (
                      <div className="text-xl font-extrabold text-red-600 drop-shadow">今日締切</div>
                    )}
                    {(task.daysLeft > 0 && task.daysLeft <= 2) && (
                      <div className="text-lg font-extrabold text-orange-500 drop-shadow">あと{task.daysLeft}日</div>
                    )}
                    {task.daysLeft > 2 && (
                      <div className="text-base font-bold text-orange-400">あと{task.daysLeft}日</div>
                    )}
                  </div>

                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="truncate text-2xl font-bold text-gray-900">{task.companyName}</h3>
                      <div className="truncate text-base text-gray-700 font-medium">{task.selectionName}</div>
                    </div>
                  </div>
                  {/* タスク内容 */}
                  <div className="text-lg font-semibold text-blue-700">{task.title}</div>
                  {/* 締切 */}
                  <div className="flex items-center gap-3 text-base text-gray-700 mt-auto">
                    <span className="font-medium">締切:</span> {task.deadline}
                  </div>
                  {/* 場所・リンク・メモ */}
                  {task.location && (
                    <div className="flex items-center gap-2 text-base text-gray-700">
                      <MapPin size={16} /> {task.location}
                    </div>
                  )}
                  {task.url && (
                    <div className="flex items-center gap-2 text-base">
                      <a 
                        href={task.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} /> リンク
                      </a>
                    </div>
                  )}
                  {task.note && (
                    <div className="text-sm text-gray-500 mt-1"><FileText size={16} className="inline-block mr-1"/>{task.note}</div>
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
  );
}
