"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckSquare,
  Flag,
  MapPin,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react"

export default function Dashboard() {

  const today = new Date()
  const todayString = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  const todaySchedule = [
    {
      time: "14:00 - 15:00",
      title: "株式会社B 一次面接",
      location: "オンライン (Zoomリンク)",
      type: "confirmed",
    },
    {
      time: "16:30 - 17:30",
      title: "株式会社C 会社説明会",
      location: "東京都渋谷区...",
      type: "confirmed",
    },
  ]

  const selectionStatus = [
    { status: "書類選考中", count: 4 },
    { status: "面接段階", count: 2 },
    { status: "結果待ち", count: 1 },
  ]

  const upcomingTasks = [
    {
      daysLeft: 2,
      task: "株式会社D エントリーシート提出",
      deadline: "6月11日(水) 23:59",
    },
    {
      daysLeft: 5,
      task: "株式会社E 適性検査受験",
      deadline: "6月14日(土) 17:00",
    },
    {
      daysLeft: 7,
      task: "株式会社F 面接日程調整",
      deadline: "6月16日(月) 12:00",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインコンテンツエリア */}
      <div className="flex-1 p-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">こんにちは、田中さん</h2>
            <p className="text-gray-600">{todayString}</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            企業を登録する
          </Button>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 今日の予定 */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                今日の予定
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySchedule.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map((schedule, index) => (
                    <div key={index} className="flex gap-4 p-3 rounded-lg bg-gray-50 border-l-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm font-medium ">
                          <Clock className="w-4 h-4" />
                          {schedule.time}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{schedule.title}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {schedule.location}
                          {schedule.location.includes("オンライン") && <ExternalLink className="w-4 h-4 ml-1" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">今日、登録されている予定はありません。</p>
              )}
            </CardContent>
          </Card>

          {/* 進行中の選考サマリー */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flag className="w-5 h-5" />
                進行中の選考
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectionStatus.map((status, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{status.status}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {status.count}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 直近のタスク */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="w-5 h-5" />
                直近のタスク (締切7日以内)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Badge
                          variant={task.daysLeft <= 3 ? "destructive" : "secondary"}
                          className={task.daysLeft <= 3 ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}
                        >
                          あと{task.daysLeft}日
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{task.task}</h4>
                        <p className="text-sm text-gray-600">締切: {task.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 font-medium">直近のタスクはありません。素晴らしい！</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
