import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  FileSpreadsheet,
  StickyNote,
  Kanban,
  Bot,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/header";
import { SignUpButton } from "@clerk/nextjs";

export default function LandingPage() {
  const features = [
    {
      title: "進捗が一目でわかるカンバン",
      description: "直感的なドラッグ＆ドロップ操作で、誰でも簡単に選考状況を可視化できます。",
      icon: Kanban,
      reverse: false,
    },
    {
      title: "AIによる予定の自動登録",
      description:
        "Gmailからの面接案内をAIが読み取り、自動でカレンダーに登録。面倒な手入力から解放されます。",
      icon: Bot,
      reverse: true,
    },
    {
      title: "企業情報の一元管理",
      description: "ES、面接メモ、企業研究の内容を一箇所で管理。情報の散らばりを防ぎます。",
      icon: FileSpreadsheet,
      reverse: false,
    },
  ];

  const problems = [
    {
      icon: FileSpreadsheet,
      title: "スプレッドシートでの複雑な進捗管理",
      description: "複雑な表計算での管理に疲れていませんか？",
    },
    {
      icon: StickyNote,
      title: "複数のメモアプリに散らばる情報",
      description: "必要な情報がどこにあるか分からない状況に",
    },
    {
      icon: Calendar,
      title: "抜け漏れが怖い、手動でのスケジュール登録",
      description: "重要な面接を忘れてしまう不安を抱えていませんか？",
    },
  ];

  const stats = [
    { number: "1+", label: "利用学生数" },
    { number: "50%(願望)", label: "内定獲得率向上" },
    { number: "200%(当社比)", label: "管理時間短縮" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーションヘッダー */}
      <Header />

      {/* セクション1: ファーストビュー */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 lg:text-6xl">
              散らばる就活情報を、
              <span className="text-blue-600">一つに。</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
              ES提出、面接予約、企業メモ。AIがあなたの就職活動をスマートに整理・加速させる、次世代のタスク管理ツール。
            </p>
            <div className="mb-12">
              <SignUpButton>
                <Button className="bg-blue-600 text-sm hover:bg-blue-700">
                  始める
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Button>
              </SignUpButton>
            </div>

            {/* キービジュアル: lucide-reactアイコンで代用 */}
            <div className="relative mx-auto flex max-w-4xl items-center justify-center py-12">
              <Kanban className="h-80 w-80 text-blue-200" />
            </div>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-600">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション2: 課題提起 */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              こんな管理方法に、限界を感じていませんか？
            </h2>
            <p className="text-xl text-gray-600">多くの就活生が抱える、共通の悩み</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card key={index} className="p-8 text-center transition-shadow hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                      <Icon className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">{problem.title}</h3>
                    <p className="text-gray-600">{problem.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* セクション3: 解決策・機能紹介 */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              その悩み、このアプリで全て解決できます
            </h2>
            <p className="text-xl text-gray-600">最新のテクノロジーで、就活を効率化</p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-12 lg:flex-row ${
                    feature.reverse ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="mb-6 text-lg text-gray-600">{feature.description}</p>
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">簡単・直感的な操作</span>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <Icon className="h-64 w-64 text-blue-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* セクション4: 最後のCTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
            さあ、ライバルに差をつける就活を始めよう
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            今すぐ無料で始めて、効率的な就職活動を体験してください
          </p>
          <SignUpButton>
            <Button
              size="lg"
              className="bg-white px-12 py-4 text-lg text-blue-600 shadow-lg hover:bg-gray-50"
            >
              今すぐ始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* セクション5: フッター */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center gap-2 md:mb-0">
              <Kanban className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">就活管理</span>
            </div>
            <div className="flex gap-8 text-gray-400">
              <a href="#" className="transition-colors hover:text-white">
                利用規約
              </a>
              <a href="#" className="transition-colors hover:text-white">
                プライバシーポリシー
              </a>
              <a href="#" className="transition-colors hover:text-white">
                お問い合わせ
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 就活管理 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
