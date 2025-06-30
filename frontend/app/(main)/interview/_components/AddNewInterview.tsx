"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GeminiAIModel } from '@/utils/GeminiAIModel';
import { LoaderCircle } from 'lucide-react';
import db from '@/lib/prisma';
import { MockInterview } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// 型定義例（必要に応じて調整）
type MockQA = { question: string; answer: string };

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDesc, jobExperience);

    const InputPrompt = `職種：${jobPosition}、職務内容：${jobDesc}、経験年数：${jobExperience}年、この情報に基づいて、JSON形式で回答付きの面接質問を5つ作成してください。JSONでは質問と回答をフィールドとして提供してください`;

    const result = await GeminiAIModel(InputPrompt);
    if (typeof result !== 'string') {
      console.error('AIモデルの返却値がstring型ではありません:', result);
      setLoading(false);
      return;
    }
    const MockJsonResponse = result.replace('```json', '').replace('```', '');
    let MockData: MockQA[] = [];
    try {
      MockData = JSON.parse(MockJsonResponse);
      console.log(MockData);
    } catch (err) {
      console.error('JSONパースエラー:', err);
      setLoading(false);
      return;
    }

    if (MockJsonResponse) {
      const response = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonMockResp: MockJsonResponse,
        jobPosition: jobPosition,
        jobDesc: jobDesc,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress ?? '',
        createdAt: moment().format('YYYY-MM-DD'),
      }).returning({ mockId: MockInterview.mockId });

      console.log("Inserted ID: ", response);
      if (response) {
        setOpenDialog(false);
        router.push(`/dashboard/interview/${response[0].mockId}`);
      }
    } else {
      console.log("ERROR");
    }

    setLoading(false);
  }

  return (
    <div>
      {/* トリガー用のボックス */}
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 transition-all duration-300 hover:shadow-md cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg">+ add New</h2>
      </div>

      {/* ダイアログ本体 */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job interviewing
            </DialogTitle>
            <DialogDescription>
              Add details about your job position/role, Job Description, and Job Experience
            </DialogDescription>
          </DialogHeader>

          {/* フォーム部分 */}
          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="font-medium block mb-1">Job Role/Position</label>
              <Input placeholder="Enter your job position" required onChange={(e) => setJobPosition(e.target.value)} />
            </div>

            <div>
              <label className="font-medium block mb-1">Job Description / Tech Stack (In short)</label>
              <Textarea placeholder="Ex. React, Angular, Node.js, etc." required onChange={(e) => setJobDesc(e.target.value)} />
            </div>

            <div>
              <label className="font-medium block mb-1">Years of Experience</label>
              <Input placeholder="Ex. 5" type="number" max={50} required onChange={(e) => setJobExperience(e.target.value)} />
            </div>

            <div className="flex gap-5 justify-end pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ?
                  <>
                    <LoaderCircle className="animate-spin" />
                    Generating from AI...
                  </>
                  : 'Start Interview'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewInterview
