"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Flag,
  Building2,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
  Edit,
  Trash2,
  FileText,
  StickyNote,
  Copy,
  ChevronDown,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompanyDetail() {
  const router = useRouter();
  const [companyMemo, setCompanyMemo] = useState(
    "説明会で聞いた内容：\n- 新規事業に力を入れている\n- リモートワーク推奨\n- 若手の裁量が大きい"
  );
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const esStock = [
    {
      id: "gakuchika",
      title: "ガクチカ",
      content:
        "大学時代に最も力を入れたことは、学園祭実行委員会での企画運営です。私はイベント企画チームのリーダーとして、来場者数を前年比20%増加させることを目標に掲げました...",
    },
    {
      id: "self-pr",
      title: "自己PR",
      content:
        "私の強みは「課題解決力」です。問題を多角的に分析し、創造的な解決策を見つけることが得意です。この強みを発揮したエピソードとして...",
    },
    {
      id: "motivation",
      title: "志望動機",
      content:
        "貴社を志望する理由は、「テクノロジーで社会課題を解決する」という企業理念に強く共感したからです。特に、貴社が手がけている...",
    },
  ];

  const selections = [
    {
      id: "1",
      name: "2025年 夏期インターンシップ",
      status: "一次面接",
      statusColor: "bg-blue-100 text-blue-800",
      nextSchedule: "次の予定: 6/15 Webテスト",
    },
    {
      id: "2",
      name: "2026年 新卒採用",
      status: "書類選考中",
      statusColor: "bg-yellow-100 text-yellow-800",
      nextSchedule: "結果待ち",
    },
  ];

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインコンテンツエリア */}
      <div className="flex-1 p-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
              <Building2 className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">株式会社A</h2>
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                https://example.com
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/companies/new`)}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
          </div>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左列 */}
          <div className="space-y-6">
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
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
                        <span className="font-medium text-gray-900">{item.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            openAccordions.includes(item.id) ? "rotate-180" : ""
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

          {/* 右列 */}
          <div>
            {/* この企業の選考一覧 */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-blue-600" />
                    この企業の選考一覧
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    選考を追加
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selections.map((selection) => (
                    <div
                      key={selection.id}
                      className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="font-medium text-gray-900">{selection.name}</h4>
                        <ChevronRight className="mt-1 h-4 w-4 text-gray-400" />
                      </div>
                      <div className="mb-2 flex items-center gap-3">
                        <Badge className={selection.statusColor}>{selection.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {selection.nextSchedule}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
