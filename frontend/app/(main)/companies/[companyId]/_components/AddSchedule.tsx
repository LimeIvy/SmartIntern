"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addScheduleSchema } from "@/schemas/add_schema";
import type { Status, SelectionType } from "@prisma/client";
import { CheckCircle2, X } from "lucide-react";

// company.selectionsの型に合わせる
export type SelectionForDialog = {
  id: string;
  name: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  type: SelectionType;
  status: Status;
  esText: string | null;
  companyId: string;
};

type AddScheduleProps = {
  selections: SelectionForDialog[];
};

export default function AddSchedule({ selections }: AddScheduleProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSelectionId, setSelectedSelectionId] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    isConfirmed: false,
    location: "",
    url: "",
    note: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // step1のバリデーション
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!selectedSelectionId) newErrors.selection = "選考を選択してください。";
    if (!form.title) newErrors.title = "スケジュールタイトルは必須です。";
    if (!form.startDate) newErrors.startDate = "開始日は必須です。";
    if (!form.startTime) newErrors.startTime = "開始時刻は必須です。";
    if (!form.endDate) newErrors.endDate = "終了日は必須です。";
    if (!form.endTime) newErrors.endTime = "終了時刻は必須です。";
    return newErrors;
  };

  // step2のバリデーション（全体）
  const validateAll = () => {
    const result = addScheduleSchema.safeParse(form);
    const newErrors: { [key: string]: string } = {};
    if (!selectedSelectionId) newErrors.selection = "選考を選択してください。";
    if (!result.success) {
      result.error.issues.forEach(issue => {
        if (issue.path[0]) newErrors[issue.path[0]] = issue.message;
      });
    }
    return newErrors;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const step1Errors = validateStep1();
    setErrors(step1Errors);
    if (Object.keys(step1Errors).length === 0) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const allErrors = validateAll();
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    setIsLoading(true);
    try {
      // 選考IDが必要
      const selectionId = selectedSelectionId;
      const toISODate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString() : "";

      const payload = {
        ...form,
        startDate: toISODate(form.startDate),
        endDate: toISODate(form.endDate),
      };

      const res = await fetch(`/api/company/${selectionId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setApiError(data?.error || "サーバーエラーが発生しました");
        setIsLoading(false);
        return;
      }
      // 成功時
      setOpen(false);
      setStep(1);
      setForm({
        title: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        isConfirmed: false,
        location: "",
        url: "",
        note: "",
      });
      setSelectedSelectionId("");
      setErrors({});
    } catch {
      setApiError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // Input要素の変更をまとめて処理する共通ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // isConfirmedの状態を更新するための専用ハンドラ
  const handleIsConfirmedChange = (isConfirmed: boolean) => {
    setForm(prev => ({ ...prev, isConfirmed }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStep(1); setErrors({}); setApiError(null); } }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          予定を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className={`flex flex-col items-center ${step === 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <div className={`rounded-full w-6 h-6 flex items-center justify-center border-2 ${step === 1 ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-white'}`}>1</div>
            <span className="text-xs mt-1">基本情報</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className={`flex flex-col items-center ${step === 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <div className={`rounded-full w-6 h-6 flex items-center justify-center border-2 ${step === 2 ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-white'}`}>2</div>
            <span className="text-xs mt-1">詳細情報</span>
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold mb-1">
            {step === 1 ? '基本情報を入力してください' : '詳細情報を入力してください'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={step === 1 ? handleNext : handleSubmit}>
          <div className="grid gap-4">
            {step === 1 && (
              <>
                <div className="grid gap-2">
                  <Label className="flex items-center">選考<span className="text-red-500">*</span></Label>
                  <Select value={selectedSelectionId} onValueChange={setSelectedSelectionId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選考を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {selections.map(sel => (
                          <SelectItem key={sel.id} value={sel.id}>{sel.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.selection && <p className="text-red-500 text-xs">{errors.selection}</p>}
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center" htmlFor="title">スケジュールタイトル<span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title" // name属性を追加
                    value={form.title}
                    onChange={handleChange} // 共通ハンドラを使用
                  />
                  {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                </div>

                {/* 日程2カラム */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <Label className="flex items-center" htmlFor="startDate">開始日<span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        id="startDate"
                        name="startDate" // name属性を追加
                        value={form.startDate}
                        onChange={handleChange} // 共通ハンドラを使用
                      />
                      {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center" htmlFor="endDate">終了日<span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        id="endDate"
                        name="endDate" // name属性を追加
                        value={form.endDate}
                        onChange={handleChange} // 共通ハンドラを使用
                      />
                      {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
                    </div>
                  </div>
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <Label className="flex items-center" htmlFor="startTime">開始時刻<span className="text-red-500">*</span></Label>
                      <Input
                        type="time"
                        id="startTime"
                        name="startTime" // name属性を追加
                        value={form.startTime}
                        onChange={handleChange} // 共通ハンドラを使用
                      />
                      {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center" htmlFor="endTime">終了時刻<span className="text-red-500">*</span></Label>
                      <Input
                        type="time"
                        id="endTime"
                        name="endTime" // name属性を追加
                        value={form.endTime}
                        onChange={handleChange} // 共通ハンドラを使用
                      />
                      {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime}</p>}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center">予定の状態<span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* 仮予定ボタン */}
                    <button
                      type="button"
                      onClick={() => handleIsConfirmedChange(false)}
                      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-center transition-colors
          ${!form.isConfirmed
                          ? 'border-red-400 bg-red-50 text-red-500 shadow-sm'
                          : 'border-gray-200 bg-transparent hover:bg-gray-50'
                        }`}
                    >
                      <X className="h-4 w-4" />
                      <p className="font-medium text-sm">未確定</p>
                    </button>

                    {/* 確定予定ボタン */}
                    <button
                      type="button"
                      onClick={() => handleIsConfirmedChange(true)}
                      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-center transition-colors
                        ${form.isConfirmed
                          ? 'border-green-600 bg-green-50 text-green-600 shadow-sm'
                          : 'border-gray-200 bg-transparent hover:bg-gray-50'
                        }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <p className="font-medium text-sm">確定</p>
                    </button>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="grid gap-3">
                  <Label>場所</Label>
                  <Input value={form.location} placeholder="東京都、 Zoomなど" onChange={e => setForm({ ...form, location: e.target.value })} />
                  {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
                </div>
                <div className="grid gap-3">
                  <Label>URL</Label>
                  <Input value={form.url} placeholder="https://..." onChange={e => setForm({ ...form, url: e.target.value })} />
                  {errors.url && <p className="text-red-500 text-xs">{errors.url}</p>}
                </div>
                <div className="grid gap-3">
                  <Label>メモ</Label>
                  <Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                  {errors.note && <p className="text-red-500 text-xs">{errors.note}</p>}
                </div>
              </>
            )}
            {apiError && (
              <p className="text-red-500 text-xs">{apiError}</p>
            )}
          </div>
          <DialogFooter>
            <div className="mt-6 flex gap-5">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>戻る</Button>
              )}
              {step === 1 ? (
                <Button type="submit" disabled={isLoading}>次へ</Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />}
                  保存
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
