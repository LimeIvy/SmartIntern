"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Flag,
  Building2,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  FileText,
  StickyNote,
  Copy,
  ChevronDown,
  Save,
  Calendar,
  Video,
  MapPin,
  Link,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Skeleton } from "@/components/ui/skeleton";
import {
  translateSelectionType,
  translateStatus,
} from "@/utils/statusTranslator";
import { Status, SelectionType } from "@prisma/client";
import { formattedDate } from "@/utils/formattedDate";
import AddSelection from "./_components/AddSelection";

type CompanyResponseType = InferResponseType<
  (typeof client.api.company)[":id"]["$get"],
  200
>;

type SelectionFormData = {
  name: string;
  type: SelectionType;
  status: Status;
  note: string;
}

interface EsStockItem {
  id: string;
  title: string;
  content: string;
}

const getStatusColor = (status: string) => {
  if (status.includes("OFFERED")) return "bg-green-100 text-green-800";
  if (status.includes("REJECTED")) return "bg-gray-100 text-gray-800";
  if (status.includes("INTERVIEW")) return "bg-blue-100 text-blue-800";
  return "bg-yellow-100 text-yellow-800";
};

export default function CompanyDetail() {
  const router = useRouter();
  const { companyId } = useParams();
  const [company, setCompany] = useState<CompanyResponseType | null>(null);
  const [companyMemo, setCompanyMemo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectionFormData, setSelectionFormData] = useState<SelectionFormData>({
    name: "",
    type: "INTERNSHIP" as SelectionType,
    status: "INTERESTED" as Status,
    note: "",
  });

  useEffect(() => {
    if (typeof companyId !== "string") {
      return;
    }
    const fetchCompany = async () => {
      try {
        const res = await client.api.company[":id"].$get({
          param: { id: companyId },
        });

        if (!res.ok) {
          throw new Error("企業の取得に失敗しました。");
        }
        const data = await res.json();
        if (data) {
          setCompany(data);
          setCompanyMemo(data.note || "");
        } else {
          throw new Error("企業データが見つかりません。");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました。"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  const handleSaveMemo = async () => {
    // メモ保存処理を書く場所
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.api.company[":id"].selection.$post({
        param: { id: companyId as string },
        json: selectionFormData,
      });
      if (!res.ok) {
        const error = await res.json();
        console.error(error);
        throw new Error("選考の追加に失敗しました。");
      }
      router.refresh();
    } catch (error) {
      console.error("選考の追加中にエラーが発生しました:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!company) {
    return <div>企業が見つかりません。</div>;
  }

  const esStock: EsStockItem[] = []; // 実際にはAPIなどで取得する
  const primaryUrl = company.urls?.[0]?.url ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl p-8">
        {/* ヘッダー */}
        <div className="mt-10 mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
              <Building2 className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                {company.name}
              </h2>
              {primaryUrl && (
                <a
                  href={primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  {primaryUrl}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/companies/${companyId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
          </div>
        </div>

        {/* メイン2カラムレイアウト */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* 左列（2/3幅） */}
          <div className="xl:col-span-2 space-y-6">
            {/* 企業メモ */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <StickyNote className="h-5 w-5 text-blue-600" />
                  企業メモ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={companyMemo}
                  onChange={(e) => setCompanyMemo(e.target.value)}
                  placeholder="説明会やOB訪問で得た情報を記録しましょう..."
                  className="mb-4 min-h-[200px]"
                />
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveMemo}
                >
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
              </CardContent>
            </Card>

            {/* ESストックルーム */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  ESストックルーム
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {esStock.map((item) => (
                    <Collapsible key={item.id}>
                      <CollapsibleTrigger
                        onClick={() => toggleAccordion(item.id)}
                        className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                      >
                        <span className="font-medium text-gray-900">
                          {item.title}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform ${openAccordions.includes(item.id)
                            ? "rotate-180"
                            : ""
                            }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <p className="mb-3 text-sm leading-relaxed text-gray-700">
                            {item.content}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Copy className="mr-2 h-4 w-4" />
                              コピー
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  新しい文章を追加
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右列（1/3幅） */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-blue-600" />
                    選考一覧
                  </div>
                  <AddSelection
                    selectionFormData={selectionFormData}
                    setSelectionFormData={setSelectionFormData}
                    statusOpen={statusOpen}
                    setStatusOpen={setStatusOpen}
                    handleAddSelection={handleAddSelection}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
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
          </div>
        </div>
      </div>
    </div>
  );
}
