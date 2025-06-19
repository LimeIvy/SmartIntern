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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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

type AddSelectionProps = {
  selectionFormData: SelectionFormData;
  setSelectionFormData: (data: SelectionFormData) => void;
  statusOpen: boolean;
  setStatusOpen: (open: boolean) => void;
  handleAddSelection: (e: React.FormEvent) => void;
};

export default function AddSelection({
  selectionFormData,
  setSelectionFormData,
  statusOpen,
  setStatusOpen,
  handleAddSelection,
}: AddSelectionProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          選考を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しい選考を追加</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddSelection}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">選考名</Label>
              <Input
                name="name"
                value={selectionFormData.name}
                onChange={(e) => setSelectionFormData({ ...selectionFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type-1">選考タイプ</Label>
              <div className="flex rounded-lg p-1 w-full justify-center bg-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectionFormData({ ...selectionFormData, type: "INTERNSHIP" as SelectionType })}
                  className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${selectionFormData.type === "INTERNSHIP" ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  インターン
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionFormData({ ...selectionFormData, type: "FULLTIME" as SelectionType })}
                  className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${selectionFormData.type === "FULLTIME" ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  本選考
                </button>
              </div>
            </div>
            <div className="grid gap-3 mb-5">
              <Label htmlFor="status-1">選考のステータス</Label>
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={statusOpen}
                    className="w-[200px] justify-between"
                  >
                    {selectionFormData.status
                      ? selectionStatus.find((status) => status.value === selectionFormData.status)?.label
                      : "選択してください"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {selectionStatus.map((status) => (
                          <CommandItem
                            key={status.value}
                            value={status.value}
                            onSelect={(currentValue) => {
                              setSelectionFormData({ ...selectionFormData, status: currentValue as Status });
                              setStatusOpen(false);
                            }}
                          >
                            {status.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                selectionFormData.status === status.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
