'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, ChevronLeft, ChevronRight, Check, ChevronsUpDown, Trash2 } from 'lucide-react';
import { Schedule } from '@prisma/client';

const SelectionScheduleDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [statusOpen, setStatusOpen] = useState(false);

  const [selectionFormData, setSelectionFormData] = useState({
    name: '',
    type: 'INTERNSHIP',
    status: ''
  });

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState({
    title: '',
    startDate: '', // 開始日を追加
    endDate: '',   // 終了日を追加
    startTime: '', // 開始時刻
    endTime: '',   // 終了時刻
    location: '',
    format: 'ONLINE',
    memo: ''
  });

  const selectionStatus = [
    { value: 'APPLIED', label: '応募済み' },
    { value: 'DOCUMENT_PASSED', label: '書類通過' },
    { value: 'INTERVIEW', label: '面接中' },
    { value: 'FINAL', label: '最終面接' },
    { value: 'OFFER', label: '内定' },
    { value: 'REJECTED', label: '不合格' }
  ];

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    console.log('選考情報:', selectionFormData);
    console.log('スケジュール一覧:', schedules);
    setOpen(false);
    setStep(1);
    resetForm();
  };

  const addSchedule = () => {
    // 必須チェック
    if (!currentSchedule.title || !currentSchedule.startDate || !currentSchedule.startTime || !currentSchedule.endTime) {
      alert('タイトル、開始日、開始時刻、終了時刻は必須です。');
      return;
    }

    // 日付と時刻の整合性チェック
    const startDateTime = new Date(`${currentSchedule.startDate}T${currentSchedule.startTime}`);
    // 終了日が空の場合は開始日と同じとみなす
    const endDateTime = new Date(`${currentSchedule.endDate || currentSchedule.startDate}T${currentSchedule.endTime}`);

    if (endDateTime < startDateTime) {
      alert('終了日時が開始日時より前です。正しい日時を入力してください。');
      return;
    }
    // 開始日と終了日が同じで、開始時刻と終了時刻が同じ場合は警告 (必要であれば)
    // if (currentSchedule.startDate === currentSchedule.endDate && currentSchedule.startTime === currentSchedule.endTime) {
    //   alert('開始時刻と終了時刻が同じです。誤りがないか確認してください。');
    //   // return; // 厳しくするなら
    // }


    setSchedules([...schedules, { ...currentSchedule, id: Date.now().toString() } as unknown as Schedule]);
    setCurrentSchedule({
      title: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      format: 'ONLINE',
      memo: ''
    });
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((schedule: { id: string }) => schedule.id !== id));
  };

  const resetForm = () => {
    setSelectionFormData({
      name: '',
      type: 'INTERNSHIP',
      status: ''
    });
    setCurrentSchedule({
      title: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      format: 'ONLINE',
      memo: ''
    });
    setSchedules([]);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => { setOpen(true); resetForm(); }} size="sm" className="bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" />
        選考を追加
      </Button>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</div>
                選考情報の入力
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</div>
                スケジュール登録
              </>
            )}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          </div>
        </DialogHeader>
        <div>
          {step === 1 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="name">選考名</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="例: 夏季インターンシップ"
                  value={selectionFormData.name}
                  onChange={(e) => setSelectionFormData({ ...selectionFormData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-3">
                <Label>選考タイプ</Label>
                <div className="flex rounded-lg p-1 w-full justify-center bg-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectionFormData({ ...selectionFormData, type: 'INTERNSHIP' })}
                    className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${selectionFormData.type === 'INTERNSHIP'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    インターン
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionFormData({ ...selectionFormData, type: 'FULLTIME' })}
                    className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${selectionFormData.type === 'FULLTIME'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    本選考
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <Label>選考のステータス</Label>
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {selectionFormData.status
                        ? selectionStatus.find((status) => status.value === selectionFormData.status)?.label
                        : '選択してください'}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <div className="max-h-60 overflow-auto">
                      {selectionStatus.map((status) => (
                        <div
                          key={status.value}
                          className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectionFormData({ ...selectionFormData, status: status.value });
                            setStatusOpen(false);
                          }}
                        >
                          <span className="flex-1">{status.label}</span>
                          {selectionFormData.status === status.value && (
                            <Check className="ml-auto h-4 w-4 opacity-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4 py-4">
              {/* Current Schedule Input Fields */}
              <div className="grid gap-3">
                <Label htmlFor="title">スケジュールタイトル</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="例: 1次面接"
                  value={currentSchedule.title}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, title: e.target.value })}
                />
              </div>

              {/* 日付と時刻の入力欄を日付またぎ対応に修正 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">開始日</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      value={currentSchedule.startDate}
                      onChange={(e) => setCurrentSchedule({ ...currentSchedule, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">終了日</Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      value={currentSchedule.endDate}
                      onChange={(e) => setCurrentSchedule({ ...currentSchedule, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3"> {/* 時間のグリッドは独立させるか、さらにネスト */}
                <div className="grid gap-2">
                  <Label htmlFor="startTime">開始時刻</Label>
                  <div className="relative">
                    <Input
                      id="startTime"
                      type="time"
                      value={currentSchedule.startTime}
                      onChange={(e) => setCurrentSchedule({ ...currentSchedule, startTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">終了時刻</Label>
                  <div className="relative">
                    <Input
                      id="endTime"
                      type="time"
                      value={currentSchedule.endTime}
                      onChange={(e) => setCurrentSchedule({ ...currentSchedule, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Label>実施形式</Label>
                <div className="flex rounded-lg p-1 w-full justify-center bg-gray-100">
                  <button
                    type="button"
                    onClick={() => setCurrentSchedule({ ...currentSchedule, format: 'ONLINE' })}
                    className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${currentSchedule.format === 'ONLINE'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    オンライン
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSchedule({ ...currentSchedule, format: 'OFFLINE' })}
                    className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${currentSchedule.format === 'OFFLINE'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    対面
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="location">場所・URL</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder={currentSchedule.format === 'ONLINE' ? 'Zoom URL など' : '住所・会場名'}
                  value={currentSchedule.location}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, location: e.target.value })}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  name="memo"
                  placeholder="準備事項や注意点など"
                  value={currentSchedule.memo}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, memo: e.target.value })}
                />
              </div>

              <Button onClick={addSchedule} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                スケジュールを追加
              </Button>

              {/* Display existing schedules */}
              {schedules.length > 0 && (
                <div className="mt-4 border rounded-md p-3 max-h-48 overflow-y-auto">
                  <h4 className="text-sm font-semibold mb-2">登録済みスケジュール:</h4>
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium">{schedule.title}</p>
                        {/* 表示も開始日・終了日・開始時刻・終了時刻に修正 */}
                        <p className="text-xs text-gray-500">
                          {(() => {
                            const start = schedule.startDate ? new Date(schedule.startDate) : null;
                            const end = schedule.endDate ? new Date(schedule.endDate) : null;
                            return `${start ? start.toLocaleDateString() : ''} ${start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - ${end ? end.toLocaleDateString() : ''} ${end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`;
                          })()}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeSchedule(schedule.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>キャンセル</Button>
              </DialogClose>
              {step === 2 && (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  戻る
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {step === 1 ? (
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  次へ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  保存
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectionScheduleDialog;