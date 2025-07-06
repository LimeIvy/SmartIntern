"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addScheduleSchema } from "@/schemas/form_schema";
import { CheckCircle2, X } from "lucide-react";
import { client } from "@/lib/hono";
import { z } from "zod";

type AddScheduleProps = {
  selectionId: string;
  onScheduleAdded: () => void;
};

type FormState = Omit<z.infer<typeof addScheduleSchema>, "selectionId">;

const INITIAL_STATE: FormState = {
  title: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  isConfirmed: false,
  location: "",
  url: "",
  note: "",
};

export default function AddSchedule({ selectionId, onScheduleAdded }: AddScheduleProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title) newErrors.title = "スケジュールタイトルは必須です。";
    if (!form.startDate) newErrors.startDate = "開始日は必須です。";
    if (!form.startTime) newErrors.startTime = "開始時刻は必須です。";
    if (!form.endDate) newErrors.endDate = "終了日は必須です。";
    if (!form.endTime) newErrors.endTime = "終了時刻は必須です。";
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const result = addScheduleSchema.safeParse(form);
    
    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) newErrors[issue.path[0]] = issue.message;
      });
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    try {
      const res = await client.api.company[':id'].schedule.$post({
        param: {
          id: selectionId,
        },
        json: form,
      });

      if (!res.ok) {
        const data = await res.json();
        const message = (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string')
          ? data.error
          : "スケジュールの追加に失敗しました。";
        throw new Error(message);
      }
      
      onScheduleAdded();
      setOpen(false);
      setStep(1);
      setForm(INITIAL_STATE);
      setErrors({});
    } catch(err) {
      setApiError(err instanceof Error ? err.message : "通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleIsConfirmedChange = (isConfirmed: boolean) => {
    setForm(prev => ({ ...prev, isConfirmed }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStep(1); setErrors({}); setApiError(null); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          予定を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {/* Step indicator */}
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
                  <Label className="flex items-center" htmlFor="title">スケジュールタイトル<span className="text-red-500">*</span></Label>
                  <Input id="title" name="title" value={form.title} onChange={handleChange} />
                  {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center" htmlFor="startDate">開始日<span className="text-red-500">*</span></Label>
                    <Input type="date" id="startDate" name="startDate" value={form.startDate} onChange={handleChange} />
                    {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate}</p>}
                  </div>
                   <div className="grid gap-2">
                    <Label className="flex items-center" htmlFor="startTime">開始時刻<span className="text-red-500">*</span></Label>
                    <Input type="time" id="startTime" name="startTime" value={form.startTime} onChange={handleChange} />
                    {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime}</p>}
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center" htmlFor="endDate">終了日<span className="text-red-500">*</span></Label>
                    <Input type="date" id="endDate" name="endDate" value={form.endDate} onChange={handleChange} />
                    {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center" htmlFor="endTime">終了時刻<span className="text-red-500">*</span></Label>
                    <Input type="time" id="endTime" name="endTime" value={form.endTime} onChange={handleChange} />
                    {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime}</p>}
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="location">場所</Label>
                  <Input id="location" name="location" value={form.location} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input id="url" name="url" value={form.url} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">メモ</Label>
                  <textarea id="note" name="note" value={form.note} onChange={handleChange} className="w-full p-2 border rounded-md" />
                </div>
                <div className="flex items-center gap-4">
                  <Label>予定は確定していますか？</Label>
                  <div className="flex rounded-lg p-1 bg-gray-100">
                    <button type="button" onClick={() => handleIsConfirmedChange(true)} className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${form.isConfirmed ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                      <CheckCircle2 className="h-4 w-4" /> 確定
                    </button>
                    <button type="button" onClick={() => handleIsConfirmedChange(false)} className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${!form.isConfirmed ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                      <X className="h-4 w-4" /> 未確定
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {apiError && <p className="text-red-500 text-xs mt-2 text-center">{apiError}</p>}
          <DialogFooter>
            <div className="flex w-full justify-between mt-4">
              {step === 1 ? (
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setStep(1)}>戻る</Button>
              )}
              <Button type="submit" disabled={isLoading}>{step === 1 ? '次へ' : (isLoading ? '保存中...' : '保存')}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
