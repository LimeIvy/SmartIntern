"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Plus } from "lucide-react";
import { client } from "@/lib/hono";

export default function AddCompany({ onCompanyAdded }: { onCompanyAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyHpUrl, setCompanyHpUrl] = useState("");
  const [companyMypageUrl, setCompanyMypageUrl] = useState("");
  const [companyMemo, setCompanyMemo] = useState("");
  const [logoError, setLogoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setCompanyName("");
    setCompanyIndustry("");
    setCompanyLogoUrl("");
    setCompanyHpUrl("");
    setCompanyMypageUrl("");
    setCompanyMemo("");
    setLogoError("");
    setError("");
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[AddCompany] Submit開始");
    setLoading(true);
    setError("");
    try {
      console.log("[AddCompany] API呼び出し前 - データ:", {
        name: companyName,
        industry: companyIndustry,
        logoUrl: companyLogoUrl,
        hpUrl: companyHpUrl,
        mypageUrl: companyMypageUrl,
        note: companyMemo,
      });

      const res = await client.api.company.$post({
        json: {
          name: companyName,
          industry: companyIndustry,
          logoUrl: companyLogoUrl,
          hpUrl: companyHpUrl,
          mypageUrl: companyMypageUrl,
          note: companyMemo,
        },
      });

      console.log("[AddCompany] API応答:", res.ok);

      if (!res.ok) {
        const data = await res.json();
        const message = (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string')
          ? data.error
          : "登録に失敗しました";
        throw new Error(message);
      }

      const responseData = await res.json();
      console.log("[AddCompany] 追加された企業データ:", responseData);

      setOpen(false);
      resetForm();
      console.log("[AddCompany] onCompanyAdded呼び出し前");
      onCompanyAdded?.();
      console.log("[AddCompany] onCompanyAdded呼び出し後");
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
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span className="text-base">新しい企業を登録</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>企業情報を追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
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

          {/* 企業ロゴURL */}
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

          {/* 企業HPURL */}
          <div className="space-y-2">
            <Label htmlFor="company-hp-url">企業HPURL</Label>
            <Input
              id="company-hp-url"
              placeholder="https://www.example.com"
              value={companyHpUrl}
              onChange={(e) => setCompanyHpUrl(e.target.value)}
            />
          </div>

          {/* 企業マイページURL */}
          <div className="space-y-2">
            <Label htmlFor="company-mypage-url">企業マイページURL</Label>
            <Input
              id="company-mypage-url"
              placeholder="https://www.example.com"
              value={companyMypageUrl}
              onChange={(e) => setCompanyMypageUrl(e.target.value)}
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
          <DialogFooter>
            {error && (
              <p className="text-xs text-red-500 w-full text-left">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={!companyName || loading}>
                {loading ? "追加中..." : "追加する"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}