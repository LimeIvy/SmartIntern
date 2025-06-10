"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompaniesList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("すべて");

  const filterOptions = ["すべて", "選考中", "内定", "お祈り", "未応募"];

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
      selections: [
        {
          name: "2025年 新卒採用",
          status: "書類選考中",
          statusColor: "bg-yellow-100 text-yellow-800",
        },
      ],
      lastUpdated: "1週間前",
    },
    {
      id: "3",
      name: "株式会社C",
      url: "https://company-c.com",
      logo: "/placeholder.svg?height=48&width=48",
      memo: "技術力の高い会社。エンジニアの働きやすさに定評がある",
      selections: [
        { name: "2025年 新卒採用", status: "お祈り", statusColor: "bg-gray-100 text-gray-800" },
      ],
      lastUpdated: "3週間前",
    },
    {
      id: "4",
      name: "株式会社D",
      url: "https://company-d.com",
      logo: "/placeholder.svg?height=48&width=48",
      memo: "グローバル展開している企業。海外勤務の機会もある",
      selections: [
        {
          name: "2025年 新卒採用",
          status: "最終面接",
          statusColor: "bg-purple-100 text-purple-800",
        },
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
  ];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "すべて") return matchesSearch;

    const hasStatus = company.selections.some((selection) => {
      switch (filterStatus) {
        case "選考中":
          return !["内定", "お祈り"].includes(selection.status);
        case "内定":
          return selection.status === "内定";
        case "お祈り":
          return selection.status === "お祈り";
        case "未応募":
          return company.selections.length === 0;
        default:
          return true;
      }
    });

    return (
      matchesSearch && (filterStatus === "未応募" ? company.selections.length === 0 : hasStatus)
    );
  });

  const CompanyCard = ({
    company,
  }: {
    company: {
      id: string;
      name: string;
      url: string;
      logo: string;
      memo: string;
      selections: { name: string; status: string; statusColor: string }[];
      lastUpdated: string;
    };
  }) => {
    const router = useRouter();
    return (
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => router.push(`/companies/${company.id}`)}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
                <Building2 className="h-6 w-6 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">{company.name}</h3>
                {company.url && (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {company.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  詳細を見る
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 選考状況 */}
          {company.selections.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">選考状況</h4>
              <div className="flex flex-wrap gap-2">
                {company.selections.map(
                  (
                    selection: { name: string; status: string; statusColor: string },
                    index: number
                  ) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">{selection.name}:</span>
                      <Badge className={selection.statusColor}>{selection.status}</Badge>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* メモ */}
          {company.memo && (
            <div className="mb-4">
              <p className="line-clamp-2 text-sm text-gray-600">{company.memo}</p>
            </div>
          )}

          {/* 最終更新日 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>最終更新: {company.lastUpdated}</span>
            <span>{company.selections.length}件の選考</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインコンテンツエリア */}
      <div className="flex-1 p-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">企業一覧</h2>
            <p className="text-gray-600">登録した企業と選考状況を管理できます</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push(`/companies/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            新しい企業を登録
          </Button>
        </div>

        {/* 検索・フィルターバー */}
        <div className="mb-6 flex gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="企業名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilterStatus(option)}
                className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === option
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 企業一覧 */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchQuery || filterStatus !== "すべて"
                ? "該当する企業が見つかりません"
                : "まだ企業が登録されていません"}
            </h3>
            <p className="mb-4 text-gray-600">
              {searchQuery || filterStatus !== "すべて"
                ? "検索条件を変更してみてください"
                : "最初の企業を登録して就活管理を始めましょう"}
            </p>
            {!searchQuery && filterStatus === "すべて" && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
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
  );
}
