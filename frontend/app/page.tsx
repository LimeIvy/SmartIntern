import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, FileSpreadsheet, StickyNote, Kanban, Bot, ArrowRight, CheckCircle } from "lucide-react"
import Header from "@/components/header"
import { SignUpButton } from "@clerk/nextjs"

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
      description: "Gmailからの面接案内をAIが読み取り、自動でカレンダーに登録。面倒な手入力から解放されます。",
      icon: Bot,
      reverse: true,
    },
    {
      title: "企業情報の一元管理",
      description: "ES、面接メモ、企業研究の内容を一箇所で管理。情報の散らばりを防ぎます。",
      icon: FileSpreadsheet,
      reverse: false,
    },
  ]

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
  ]

  const stats = [
    { number: "1+", label: "利用学生数" },
    { number: "50%(願望)", label: "内定獲得率向上" },
    { number: "200%(当社比)", label: "管理時間短縮" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーションヘッダー */}
      <Header />

      {/* セクション1: ファーストビュー */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              散らばる就活情報を、
              <span className="text-blue-600">一つに。</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              ES提出、面接予約、企業メモ。AIがあなたの就職活動をスマートに整理・加速させる、次世代のタスク管理ツール。
            </p>
            <div className="mb-12">
              <SignUpButton>
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                  始める
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </SignUpButton>
            </div>

            {/* キービジュアル: lucide-reactアイコンで代用 */}
            <div className="relative max-w-4xl mx-auto flex items-center justify-center py-12">
              <Kanban className="w-80 h-80 text-blue-200" />
            </div>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション2: 課題提起 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              こんな管理方法に、限界を感じていませんか？
            </h2>
            <p className="text-xl text-gray-600">多くの就活生が抱える、共通の悩み</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problems.map((problem, index) => {
              const Icon = problem.icon
              return (
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{problem.title}</h3>
                    <p className="text-gray-600">{problem.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* セクション3: 解決策・機能紹介 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              その悩み、このアプリで全て解決できます
            </h2>
            <p className="text-xl text-gray-600">最新のテクノロジーで、就活を効率化</p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-center gap-12 ${feature.reverse ? "lg:flex-row-reverse" : ""
                    }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">簡単・直感的な操作</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <Icon className="w-64 h-64 text-blue-200" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* セクション4: 最後のCTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">さあ、ライバルに差をつける就活を始めよう</h2>
          <p className="text-xl text-blue-100 mb-8">今すぐ無料で始めて、効率的な就職活動を体験してください</p>
          <SignUpButton>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-12 py-4 shadow-lg">
              今すぐ始める
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* セクション5: フッター */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Kanban className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-bold text-white">就活管理</span>
            </div>
            <div className="flex gap-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                利用規約
              </a>
              <a href="#" className="hover:text-white transition-colors">
                プライバシーポリシー
              </a>
              <a href="#" className="hover:text-white transition-colors">
                お問い合わせ
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 就活管理 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
