"use client";

import { useState, useEffect } from "react";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Building2, Plus, Search, MoreVertical, Trash2, Eye, Calendar, Video, MapPin, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { translateSelectionType, translateStatus } from "@/utils/statusTranslator";
import { Skeleton } from "@/components/ui/skeleton";
import { formattedDate } from "@/utils/formattedDate";

// APIレスポンスの型を拡張してselectionsをオプショナルで含める
type CompanyFromApi = InferResponseType<(typeof client.api.company)["$get"], 200>[number];

const getStatusColor = (status: string) => {
  // このマッピングは実際のステータス名に合わせて調整が必要です
  if (status.includes("OFFERED")) return "bg-green-100 text-green-800";
  if (status.includes("REJECTED")) return "bg-gray-100 text-gray-800";
  if (status.includes("INTERVIEW")) return "bg-blue-100 text-blue-800";
  return "bg-yellow-100 text-yellow-800";
};

const CompanyCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-center justify-end">
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </CardContent>
  </Card>
);

export default function CompaniesList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("すべて");
  const [companies, setCompanies] = useState<CompanyFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await client.api.company.$get();
        if (!res.ok) {
          throw new Error("企業の取得に失敗しました。");
        }
        const data = await res.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filterOptions = ["すべて", "選考中", "内定", "お祈り"];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "すべて") return matchesSearch;

    const hasStatus = company.selections.some((selection) => {
      switch (filterStatus) {
        case "選考中":
          return !["OFFERED", "REJECTED"].some((s) => selection.status.includes(s));
        case "内定":
          return selection.status.includes("OFFERED");
        case "お祈り":
          return selection.status.includes("REJECTED");
        default:
          return true;
      }
    });

    return (
      matchesSearch && (filterStatus === "未応募" ? company.selections.length === 0 : hasStatus)
    );
  });

  const handleDelete = async (companyId: string) => {
    try {
      await client.api.company[":id"].$delete({
        param: { id: companyId },
      });
      setCompanies(companies.filter((company) => company.id !== companyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "企業の削除に失敗しました。");
    }
  };

  const CompanyCard = ({ company }: { company: CompanyFromApi }) => {
    const router = useRouter();

    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
                <Building2 className="h-6 w-6 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 truncate text-lg font-semibold text-gray-900">
                  {company.name}
                </h3>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/companies/${company.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  詳細を見る
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(company.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* メモ */}
          {company.note ? (
            <div className="mb-4">
              <p className="line-clamp-2 text-sm text-gray-600">{company.note}</p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="line-clamp-2 text-sm text-gray-600">会社メモはありません</p>
            </div>
          )}

          {/* 選考状況 */}
          <div className="space-y-4">
            {company.selections.length > 0 ? (
              <div className="space-y-6">
                {/* selectionsのループはここだけ */}
                {company.selections.map((selection, index) => (
                  <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                    {/* 選考情報 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-md text-gray-800">{selection.name}</h4>
                        <span className="text-sm text-gray-500">({translateSelectionType(selection.type)})</span>
                      </div>
                      <Badge className={getStatusColor(selection.status)}>
                        {translateStatus(selection.status)}
                      </Badge>
                    </div>

                    {/* 紐づくスケジュール */}
                    {selection.schedules.length > 0 ? (
                      <div className="space-y-1 pl-4">
                        {selection.schedules.map((schedule, sIndex) => (
                          <div key={sIndex}>
                            <Accordion
                              type="single"
                              collapsible
                              className="w-full"
                            >
                              <AccordionItem value={schedule.id}>
                                <AccordionTrigger><p className="font-medium text-gray-700">{schedule.title}</p></AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formattedDate(schedule.startDate)}～{formattedDate(schedule.endDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                    {/* 場所に応じてアイコンを出し分ける */}
                                    {schedule.location?.toLowerCase().includes('オンライン') ? (
                                      <Video className="h-4 w-4" />
                                    ) : (
                                      <MapPin className="h-4 w-4" />
                                    )}
                                    <span>{schedule.location}</span>
                                  </div>
                                  {schedule.url && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                      <Link className="h-4 w-4" />
                                      <a href={schedule.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{schedule.url}</a>
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>


                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 pl-4">この選考のスケジュールはありません。</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>選考情報はありません。</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">企業一覧</h2>
              <p className="text-gray-600">登録した企業と選考状況を管理できます</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled>
              <Plus className="mr-2 h-4 w-4" />
              新しい企業を登録
            </Button>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input placeholder="企業名で検索..." className="pl-10" disabled value="" />
            </div>

            <div className="flex rounded-lg bg-gray-100 p-1">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  disabled
                  className="rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap text-gray-600 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium text-red-600">エラーが発生しました</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインコンテンツエリア */}
      <div className="flex-1 p-8 mt-10">
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
                className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === option
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
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/companies/new`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                新しい企業を登録
              </Button>
            )}
          </div>
        )}

        {/* 統計情報 */}
        {companies.length > 0 && (
          <div className="mt-8 text-sm text-gray-600">
            {searchQuery || filterStatus !== "すべて"
              ? `合計 ${filteredCompanies.length}社を登録中`
              : `合計 ${companies.length}社を登録中`}
          </div>
        )}
      </div>
    </div>
  );
}
