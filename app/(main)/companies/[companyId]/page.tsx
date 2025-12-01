"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { companyAtom, companyIdAtom } from "@/store/company";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Flag,
  Building2,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Link2 as LinkIcon,
  NotepadText,
} from "lucide-react";
import { client } from "@/lib/hono";
import { Skeleton } from "@/components/ui/skeleton";
import {
  translateSelectionType,
  translateStatus,
} from "@/utils/statusTranslator";
import { formattedDate } from "@/utils/formattedDate";
import AddSelection from "./_components/AddSelection";
import AddSchedule from "./_components/AddSchedule";
import Link from "next/link";

const getStatusColor = (status: string) => {
  if (status.includes("OFFERED")) return "bg-green-100 text-green-800";
  if (status.includes("REJECTED")) return "bg-gray-100 text-gray-800";
  if (status.includes("INTERVIEW")) return "bg-blue-100 text-blue-800";
  return "bg-yellow-100 text-yellow-800";
};

const CompanyDetailContent = () => {
  const router = useRouter();
  const { companyId } = useParams();

  const companyData = useAtomValue(companyAtom);
  const dispatch = useSetAtom(companyAtom);
  const company = companyData.data;

  const handleRefetch = () => {
    (dispatch as (action: { type: 'refetch' }) => void)({ type: 'refetch' });
  };

  const handleDeleteCompany = async () => {
    if (!company) return;
    try {
      await client.api.company[":id"].$delete({
        param: { id: company.id },
      });
      router.push("/companies");
    } catch (err) {
      console.error("削除に失敗しました", err);
    }
  };

  if (companyData.isPending) {
    return <CompanyDetailSkeleton />;
  }

  if (companyData.error) {
    return <div className="text-red-500">エラー: {companyData.error.message}</div>;
  }

  if (!company) {
    return <div>企業が見つかりません。</div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-8">
      {/* Header */}
      <div className="mt-10 mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
            <Building2 className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900">{company.name}</h2>
            <div className="text-lg">
              {company.hpUrl && (
                <div className="flex items-center">
                  <Link href={company.hpUrl} target="_blank" className="flex min-w-0 items-center gap-1 text-blue-600 hover:text-blue-800">
                    <span className="truncate">公式サイト</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              )}
              {company.mypageUrl && (
                <div className="flex items-center">
                  <Link href={company.mypageUrl} target="_blank" className="flex min-w-0 items-center gap-1 text-blue-600 hover:text-blue-800">
                    <span className="truncate">マイページ</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => router.push(`/companies/${companyId}/edit`)}>
            <Edit className="h-4 w-4" />
            <span className="text-lg">編集</span>
          </Button>
          <Button variant="outline" size="lg" className="text-red-600 hover:text-red-700" onClick={handleDeleteCompany}>
            <Trash2 className="h-4 w-4" />
            <span className="text-lg">削除</span>
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* 左カラム */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center gap-2">
                  <Flag className="h-6 w-6 text-blue-600" />
                  <span className="text-2xl">選考一覧</span>
                </div>
                <AddSelection onSelectionAdded={handleRefetch} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 選考一覧 */}
              {company.selections && company.selections.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {company.selections.map((selection) => (
                    <AccordionItem value={selection.id} key={selection.id} className="bg-white">
                      <AccordionTrigger className="p-4 cursor-pointer">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{selection.name}</h3>
                            <p className="text-md text-gray-500">({translateSelectionType(selection.type)})</p>
                          </div>
                          <Badge className={getStatusColor(selection.status)}>
                            {translateStatus(selection.status)}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                        <p className="mb-4 text-gray-600">{selection.note || ""}</p>

                        {/* スケジュール一覧 */}
                        {selection.schedules && selection.schedules.length > 0 ? (
                          <div className="space-y-2">
                            {selection.schedules.map((schedule) => (
                              <Card key={schedule.id} className="p-3">
                                <p className="font-semibold">{schedule.title}</p>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formattedDate(schedule.startDate)}～{formattedDate(schedule.endDate)}</span>
                                  </div>
                                  {schedule.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <span>{schedule.location}</span>
                                    </div>
                                  )}
                                  {schedule.url && (
                                    <div className="flex items-center gap-2">
                                      <LinkIcon className="h-4 w-4" />
                                      <a href={schedule.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {schedule.url}
                                      </a>
                                    </div>
                                  )}
                                  {schedule.note && (
                                    <div className="flex items-center gap-2">
                                      <NotepadText className="h-4 w-4" />
                                      <span>{schedule.note}</span>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500">予定はまだありません。</p>
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                          <AddSchedule selectionId={selection.id} onScheduleAdded={handleRefetch} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center">
                  <p>選考情報はありません。</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右カラム */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">企業メモ</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{company.note || "メモはありません。"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CompanyDetailSkeleton = () => (
  <div className="mx-auto w-full max-w-7xl p-8">
    {/* ヘッダー */}
    <div className="mt-10 mb-8 flex items-start justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-12 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-6">
        <Skeleton className="h-96 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const setCompanyId = useSetAtom(companyIdAtom);

  useEffect(() => {
    if (typeof companyId === 'string') {  // 企業IDが存在する場合
      setCompanyId(companyId);
    }
    return () => setCompanyId(null);
  }, [companyId, setCompanyId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<CompanyDetailSkeleton />}>
        <CompanyDetailContent />
      </Suspense>
    </div>
  );
}