'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { client } from "@/lib/hono";

type UserAnswer = {
  id: string;
  question: string;
  answer: string;
  totalScore: number;
  specificityScore: number;
  logicScore: number;
  starStructureScore: number;
  companyFitScore: number;
  growthScore: number;
  feedback: string;
  followUpQuestion: string | null;
}

const FeedBack = () => {

  const { interviewId } = useParams();


  const [feedbackList, setFeedbackList] = useState<UserAnswer[]>([]);
  const router = useRouter();
  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    // 各質問ごとに最新idを取得
    if (!interviewId || typeof interviewId !== 'string') return;
    const latestIdsResult = await client.api.interview[":interviewId"].feedback.$get({ param: { interviewId } });

    const latestIds = await latestIdsResult.json();

    if (latestIds) {
      setFeedbackList(latestIds as UserAnswer[]);
      console.log(feedbackList);
    }
  }
  return (
    <div className="p-10">

      {feedbackList.length === 0 ? <h2 className="text-xl font-bold">No feedback found</h2> :
        <>
          <h2 className="text-3xl font-bold text-green-500">
            Congratulations!
          </h2>
          <h2 className="text-2xl font-bold">Here is your feedback</h2>
          <h2 className="text-purple-500 text-lg my-3"> Your overrall interview rating: <strong>8/10</strong></h2>
          {feedbackList && feedbackList.map((item) => (
            <Collapsible key={item.id} className="mt-7">
              <CollapsibleTrigger className="p-2 flex justify-between bg-secondary rounded-lg my-2 text-left gap-7 w-full">
                <h3>{item.question}</h3> <ChevronsDown className="w-5 h-5" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-2">
                  <h2 className="text-red-500 p-2 border rounded-lg"> <strong>TotalScore: </strong> {item.totalScore} </h2>
                  <h2 className="text-red-500 p-2 border rounded-lg"> <strong>SpecificityScore: </strong> {item.specificityScore} </h2>
                  <h2 className="text-red-500 p-2 border rounded-lg"> <strong>LogicScore: </strong> {item.logicScore} </h2>
                  <h2 className="text-red-500 p-2 border rounded-lg"> <strong>StarStructureScore: </strong> {item.starStructureScore} </h2>
                  <h2 className="text-red-500 p-2 border rounded-lg"> <strong>CompanyFitScore: </strong> {item.companyFitScore} </h2>
                  <h2 className="text-red-500 p-2 border rounded-lg"> <strong>GrowthScore: </strong> {item.growthScore} </h2>
                  <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-red-900"> <strong>Your Answer: </strong> {item.answer} </h2>
                  <h2 className="p-2 border rounded-lg bg-blue-50 text-sm text-blue-900"> <strong>Feedback: </strong> {item.feedback} </h2>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </>
      }


      <Button onClick={() => router.replace('/interview')}> Go Home </Button>
    </div>
  )
}

export default FeedBack
