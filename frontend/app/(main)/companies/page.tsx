"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function CompaniesList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("すべて")

  const filterOptions = ["すべて", "選考中", "内定", "お祈り", "未応募"]

  // サンプルデータ
  const companies = [
    {
      id: "1",
      name: "株式会社A",
      url: "https://company-a.com",
      logo: "/placeholder.svg?height=48&width=48",
      memo: "説明会で聞いた内容：新規事業に力を入れている、リモートワーク推奨",
      selections: [
        { name: "2025年 新卒採用", status: "一次面接", statusColor: "bg-blue-100 text-blue-800" },
        { name: "夏期インターン", status: "内定", statusColor: "bg-green-100 text-green-800" },
      ],
      lastUpdated: "2日前",
    },
    {
      id: "2",
      name: "株式会社B",
      url: "https://company-b.com",
      logo: "/placeholder.svg?height=48&width=48",
      memo: "OB訪問で得た情報：若手の裁量が大きい、成長環境が整っている",
      selections: [{ name: "2025年 新卒採用", status: "書類選考中", statusColor: "bg-yellow-100 text-yellow-800" }],
      lastUpdated: "1週間前",
    },
    {
      id: "3",
      name: "株式会社C",
      url: "https://company-c.com",
      logo: "/placeholder.svg?height=48&width=48",
      memo: "技術力の高い会社。エンジニアの働きやすさに定評がある",
      selections: [{ name: "2025年 新卒採用", status: "お祈り", statusColor: "bg-gray-100 text-gray-800" }],
      lastUpdated: "3週間前",
    },
    {
      id: "4",
      name: "株式会社D",
      url: "https://company-d.com",
      logo: "/placeholder.svg?height=48&width=48",
      memo: "グローバル展開している企業。海外勤務の機会もある",
      selections: [
        { name: "2025年 新卒採用", status: "最終面接", statusColor: "bg-purple-100 text-purple-800" },
        { name: "冬期インターン", status: "内定", statusColor: "bg-green-100 text-green-800" },
      ],
      lastUpdated: "5日前",
    },
    {
      id: "5",
      name: "株式会社E",
      url: "https://company-e.com",
      logo: "/placeholder.svg?height=48&width=48",
      memo: "",
      selections: [],
      lastUpdated: "1ヶ月前",
    },
  ]

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterStatus === "すべて") return matchesSearch

    const hasStatus = company.selections.some((selection) => {
      switch (filterStatus) {
        case "選考中":
          return !["内定", "お祈り"].includes(selection.status)
        case "内定":
          return selection.status === "内定"
        case "お祈り":
          return selection.status === "お祈り"
        case "未応募":
          return company.selections.length === 0
        default:
          return true
      }
    })

    return matchesSearch && (filterStatus === "未応募" ? company.selections.length === 0 : hasStatus)
  })

  const CompanyCard = ({ company }: { company: { id: string; name: string; url: string; logo: string; memo: string; selections: { name: string; status: string; statusColor: string }[]; lastUpdated: string } }) => {
    const router = useRouter()
    return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/companies/${company.id}`)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{company.name}</h3>
              {company.url && (
                <a
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {company.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                詳細を見る
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                編集
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 選考状況 */}
        {company.selections.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">選考状況</h4>
            <div className="flex flex-wrap gap-2">
              {company.selections.map((selection: { name: string; status: string; statusColor: string }, index: number) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">{selection.name}:</span>
                  <Badge className={selection.statusColor}>{selection.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* メモ */}
        {company.memo && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{company.memo}</p>
          </div>
        )}

        {/* 最終更新日 */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>最終更新: {company.lastUpdated}</span>
          <span>{company.selections.length}件の選考</span>
        </div>
      </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインコンテンツエリア */}
      <div className="flex-1 p-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">企業一覧</h2>
            <p className="text-gray-600">登録した企業と選考状況を管理できます</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push(`/companies/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            新しい企業を登録
          </Button>
        </div>

        {/* 検索・フィルターバー */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="企業名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilterStatus(option)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === option ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 企業一覧 */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterStatus !== "すべて"
                ? "該当する企業が見つかりません"
                : "まだ企業が登録されていません"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== "すべて"
                ? "検索条件を変更してみてください"
                : "最初の企業を登録して就活管理を始めましょう"}
            </p>
            {!searchQuery && filterStatus === "すべて" && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                新しい企業を登録
              </Button>
            )}
          </div>
        )}

        {/* 統計情報 */}
        {filteredCompanies.length > 0 && (
          <div className="mt-8 text-sm text-gray-600">
            {searchQuery || filterStatus !== "すべて"
              ? `${filteredCompanies.length}件の企業が見つかりました`
              : `合計 ${companies.length}社を管理中`}
          </div>
        )}
      </div>
    </div>
  )
}
