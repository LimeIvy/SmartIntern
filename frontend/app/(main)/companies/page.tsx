"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { companiesAtom } from "@/store/companies";
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
} from "@/components/ui/accordion";
import { Building2, Search, MoreVertical, Trash2, Eye, Calendar, MapPin, Link2 as LinkIcon, NotepadText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translateSelectionType, translateStatus } from "@/utils/statusTranslator";
import { Skeleton } from "@/components/ui/skeleton";
import { formattedDate } from "@/utils/formattedDate";
import AddCompany from "./_components/add-company";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { selectionFilterAtom } from "@/store/filter-atom";

type CompanyFromApi = InferResponseType<(typeof client.api.company)["$get"], 200>[number];

const getStatusColor = (status: string) => {
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

const CompaniesList = () => {
  const companiesData = useAtomValue(companiesAtom);
  const companies = companiesData.data ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("すべて");
  const selectionFilter = useAtomValue(selectionFilterAtom);

  console.log("[CompaniesList] companiesData:", companiesData);
  console.log("[CompaniesList] companies:", companies);
  console.log("[CompaniesList] isPending:", companiesData.isPending);
  console.log("[CompaniesList] error:", companiesData.error);

  const filterOptions = ["すべて", "選考中", "内定", "お祈り"];

  const filteredCompanies = companies.map(company => {
    if (selectionFilter === 'ALL') {
      return company;
    }
    return {
      ...company,
      selections: company.selections.filter(selection => selection.type === selectionFilter),
    };
  }).filter((company) => {
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

  const getCompanyCountsByType = () => {
    const internshipCompanies = new Set<string>();
    const fulltimeCompanies = new Set<string>();

    companies.forEach(company => {
      let hasInternship = false;
      let hasFulltime = false;

      company.selections.forEach(selection => {
        if (selection.type === 'INTERNSHIP') {
          hasInternship = true;
        }
        if (selection.type === 'FULLTIME') {
          hasFulltime = true;
        }
      });

      if (hasInternship) internshipCompanies.add(company.id);
      if (hasFulltime) fulltimeCompanies.add(company.id);
    });

    const totalActiveCompanies = new Set([...internshipCompanies, ...fulltimeCompanies]).size;

    return {
      internship: internshipCompanies.size,
      fulltime: fulltimeCompanies.size,
      total: totalActiveCompanies,
    };
  };

  const { internship: internshipCount, fulltime: fulltimeCount } = getCompanyCountsByType();

  const handleDelete = async (companyId: string) => {
    try {
      await client.api.company[":id"].$delete({
        param: { id: companyId },
      });
      console.log("[CompaniesList] handleDelete - refetch呼び出し");
      companiesData.refetch();
    } catch (err) {
      console.error(err instanceof Error ? err.message : "企業の削除に失敗しました。");
    }
  };

  const CompanyCard = ({ company }: { company: CompanyFromApi }) => {
    const router = useRouter();

    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
                <Building2 className="h-8 w-8 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-3xl font-bold text-gray-900">
                  {company.name}
                </h3>
                <div className="h-10">
                  {company.hpUrl && (
                    <div className="flex items-center">
                      <Link
                        href={company.hpUrl}
                        target="_blank"
                        className="flex min-w-0 items-center text-blue-600 hover:text-blue-800"
                      >
                        <span className="truncate">公式サイト</span>
                        <LinkIcon className="h-4 w-4 shrink-0" />
                      </Link>
                    </div>
                  )}

                  {company.mypageUrl && (
                    <div className="flex items-center">
                      <Link
                        href={company.mypageUrl}
                        target="_blank"
                        className="flex min-w-0 items-center text-blue-600 hover:text-blue-800"
                      >
                        <span className="truncate">マイページ</span>
                        <LinkIcon className="h-4 w-4 shrink-0" />
                      </Link>
                    </div>
                  )}
                </div>
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="company-note">
              <AccordionTrigger className="cursor-pointer">
                <h4 className="text-xl text-gray-700">会社概要</h4>
              </AccordionTrigger>
              <AccordionContent>
                {company.note ? (
                  <p className="text-sm text-gray-600">{company.note}</p>
                ) : (
                  <p className="text-sm text-gray-600">会社メモはありません</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-4">
            {company.selections.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="selections">
                  <AccordionTrigger className="cursor-pointer">
                    <h4 className="text-xl text-gray-800">選考情報</h4>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      {company.selections.map((selection, index) => (
                        <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg text-gray-800">{selection.name}</h4>
                              <span className="text-sm text-gray-500">({translateSelectionType(selection.type)})</span>
                            </div>
                            <Badge className={getStatusColor(selection.status)}>
                              {translateStatus(selection.status)}
                            </Badge>
                          </div>

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
                                        {schedule.location && (
                                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{schedule.location}</span>
                                          </div>
                                        )}
                                        {schedule.url && (
                                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                            <LinkIcon className="h-4 w-4" />
                                            <a href={schedule.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{schedule.url}</a>
                                          </div>
                                        )}
                                        {schedule.note && (
                                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                            <NotepadText className="h-4 w-4" />
                                            <span>{schedule.note}</span>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="py-4">
                <h4 className="text-sm font-semibold text-gray-500">※選考情報はまだありません</h4>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (companiesData.isPending) {
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (companiesData.error) {
      return (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-red-600">
            エラーが発生しました
          </h3>
          <p className="text-gray-600">{companiesData.error.message}</p>
        </div>
      );
    }

    if (filteredCompanies.length > 0) {
      return (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      );
    }

    return (
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
          <AddCompany onCompanyAdded={() => {
            console.log("[CompaniesList] AddCompany onCompanyAdded呼び出し");
            console.log("[CompaniesList] companiesData.refetch:", companiesData.refetch);
            companiesData.refetch();
            console.log("[CompaniesList] refetch完了");
          }} />
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8 mt-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">企業一覧</h2>
          </div>
          <AddCompany onCompanyAdded={() => {
            companiesData.refetch();
          }} />
        </div>

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

        {renderContent()}

        {!companiesData.isPending && !companiesData.error && companies.length > 0 && (
          <div className="mt-8 text-sm text-gray-600">
            {searchQuery || filterStatus !== "すべて"
              ? `検索結果: ${filteredCompanies.length}社`
              : `インターン: ${internshipCount}社, 本選考: ${fulltimeCount}社`}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CompaniesPage() {
  return <CompaniesList />
}