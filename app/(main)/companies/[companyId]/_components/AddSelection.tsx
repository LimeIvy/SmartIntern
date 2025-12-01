"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { addSelectionSchema } from "@/schemas/form_schema";
import { useParams } from "next/navigation";
import { client } from "@/lib/hono";
import type { Status, SelectionType } from "@prisma/client";

// 選考ステータス一覧
const selectionStatus = [
  { value: "INTERESTED", label: "興味あり" },
  { value: "APPLIED", label: "応募済み" },
  { value: "ES_SUBMITTED", label: "ES提出済み" },
  { value: "WEBTEST", label: "Webテスト" },
  { value: "INTERVIEW_1", label: "一次面接" },
  { value: "INTERVIEW_2", label: "二次面接" },
  { value: "INTERVIEW_3", label: "三次面接以降" },
  { value: "FINAL", label: "最終面接" },
  { value: "OFFERED", label: "内定" },
  { value: "REJECTED", label: "お祈り" },
];

type SelectionFormData = {
  name: string;
  type: SelectionType;
  status: Status;
  note: string;
};

const INITIAL_STATE: SelectionFormData = {
  name: "",
  type: "INTERNSHIP",
  status: "INTERESTED",
  note: "",
};

type AddSelectionProps = {
  onSelectionAdded: () => void;
};

export default function AddSelection({ onSelectionAdded }: AddSelectionProps) {
  const { companyId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<SelectionFormData>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = addSelectionSchema.safeParse(formData);
    if (!result.success) {
      const nameError = result.error.issues.find(issue => issue.path[0] === "name")?.message;
      setError(nameError ?? null);
      return;
    }

    try {
      const res = await client.api.company[":id"].selection.$post({
        param: { id: companyId as string },
        json: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = (errorData && typeof errorData === 'object' && 'error' in errorData && typeof errorData.error === 'string')
          ? errorData.error
          : "選考の追加に失敗しました。";
        throw new Error(message);
      }
      
      onSelectionAdded();
      setIsOpen(false);
      setFormData(INITIAL_STATE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setError(null);
      setFormData(INITIAL_STATE);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span className="text-base">選考を追加</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しい選考を追加</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">選考名</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type-1">選考タイプ</Label>
              <div className="flex rounded-lg p-1 w-full justify-center bg-gray-100">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "INTERNSHIP" as SelectionType })}
                  className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${formData.type === "INTERNSHIP" ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  インターン
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "FULLTIME" as SelectionType })}
                  className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${formData.type === "FULLTIME" ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  本選考
                </button>
              </div>
            </div>
            <div className="grid gap-3 mb-5">
              <Label htmlFor="status-1">選考のステータス</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="選択してください">
                    {formData.status
                      ? selectionStatus.find((status) => status.value === formData.status)?.label
                      : '選択してください'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectGroup>
                    {selectionStatus.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                        {formData.status === status.value && (
                          <Check className="ml-auto h-4 w-4 opacity-100" />
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <div className="mt-3 flex gap-5">
              <DialogClose asChild>
                <Button type="button" variant="outline">キャンセル</Button>
              </DialogClose>
              <Button type="submit">保存</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
