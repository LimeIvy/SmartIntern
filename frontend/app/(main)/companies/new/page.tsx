"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CompanyNew() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyMemo, setCompanyMemo] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [logoError, setLogoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          industry: companyIndustry,
          note: companyMemo,
          logoUrl: companyLogoUrl,
          urls: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "登録に失敗しました");
      }
      router.push("/companies");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "登録に失敗しました");
      } else {
        setError("登録に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインコンテンツエリア */}
      <div className="flex flex-1 justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* ヘッダー */}
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold">企業情報を追加</h2>
            <p>企業名とURLを追加しましょう。</p>
          </div>

          {/* 入力フォーム */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">

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

                {/* 企業ロゴURL or ファイル */}
                <div className="space-y-2">
                  <Label htmlFor="company-logo-url">企業ロゴURL</Label>
                  <Input
                    id="company-logo-url"
                    placeholder="https://www.example.com/logo.png"
                    value={companyLogoUrl}
                    onChange={(e) => {
                      setCompanyLogoUrl(e.target.value);
                      setLogoError("");
                    }}
                    className="flex-1"
                  />
                  <div className="pt-2">
                    <Label htmlFor="company-logo-file">またはローカル画像を選択</Label>
                    <Input
                      id="company-logo-file"
                      type="file"
                      accept="image/*"
                      className="mt-2"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoError("");
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setCompanyLogoUrl(ev.target?.result as string);
                          };
                          reader.onerror = () => {
                            setLogoError("画像の読み込みに失敗しました。");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {companyLogoUrl && !logoError && (
                    <div className="pt-2">
                      <Image
                        src={companyLogoUrl}
                        alt="企業ロゴプレビュー"
                        className="max-h-24 rounded border"
                        width={100}
                        height={100}
                        onError={() => setLogoError("画像を読み込めませんでした。URLまたはファイルを確認してください。")}
                      />
                    </div>
                  )}
                  {logoError && (
                    <p className="text-xs text-red-500">{logoError}</p>
                  )}
                </div>

                {/* 企業業界 */}
                <div className="space-y-2">
                  <Label htmlFor="company-industry">業界</Label>
                  <Input
                    id="company-industry"
                    placeholder="例：IT"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
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
                  <Button type="button" variant="ghost" onClick={() => router.push(`/companies`)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={!companyName || loading}>
                    {loading ? "追加中..." : "追加する"}
                  </Button>
                </div>
                {error && (
                  <p className="text-xs text-red-500 pt-2">{error}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
