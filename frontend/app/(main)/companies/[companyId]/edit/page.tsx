"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function CompanyNew() {
  const router = useRouter();
  const { companyId } = useParams();
  const [companyUrl, setCompanyUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyMemo, setCompanyMemo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信処理（実際の実装では、ここでデータを保存し、詳細ページへリダイレクト）
    console.log({ companyUrl, companyName, companyMemo });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインコンテンツエリア */}
      <div className="flex flex-1 justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* ヘッダー */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => router.push(`/campanies/${companyId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <h2 className="mb-2 text-3xl font-bold">企業情報を編集</h2>
            <p>企業名とURLを編集しましょう。</p>
          </div>

          {/* 入力フォーム */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 企業URL */}
                <div className="space-y-2">
                  <Label htmlFor="company-url">企業URL</Label>
                  <Input
                    id="company-url"
                    placeholder="https://www.example.com"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* 企業名 */}
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="flex items-center">
                    企業名
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    id="company-name"
                    placeholder="例：株式会社A"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                {/* 企業メモ */}
                <div className="space-y-2">
                  <Label htmlFor="company-memo">メモ</Label>
                  <p className="text-xs">説明会で聞いたこと、OB訪問の記録など</p>
                  <Textarea
                    id="company-memo"
                    placeholder="メモを入力..."
                    value={companyMemo}
                    onChange={(e) => setCompanyMemo(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                {/* アクションボタン */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost">
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={!companyName}>
                    保存して詳細ページへ
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
