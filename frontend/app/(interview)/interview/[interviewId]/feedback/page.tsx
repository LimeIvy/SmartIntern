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
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CATEGORY_CONFIGS } from '@/data/category-config';

// カテゴリごとの最大点を自動計算
const CATEGORY_MAX: Record<string, number> = {};
Object.entries(CATEGORY_CONFIGS).forEach(([cat, conf]) => {
  CATEGORY_MAX[cat] = Object.values(conf.weightings).reduce((a, b) => a + b, 0);
});

type UserAnswer = {
  id: string;
  category: string;
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
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    if (!interviewId || typeof interviewId !== 'string') return;
    const latestIdsResult = await client.api.interview[":interviewId"].feedback.$get({ param: { interviewId } });
    const latestIds = await latestIdsResult.json();
    if (latestIds) {
      setFeedbackList(latestIds as UserAnswer[]);
      // カテゴリごとに点数集計
      let sum = 0;
      let max = 0;
      (latestIds as UserAnswer[]).forEach(item => {
        const cat = item.category;
        sum += item.totalScore;
        max += CATEGORY_MAX[cat] ?? 100;
      });
      setTotalScore(sum);
      setMaxScore(max);
    }
  }

  // 合計点から評価
  const getEvaluation = (score: number, max: number) => {
    const rate = (score / max) * 100;
    if (rate >= 70) return { label: 'SUFFICIENT', color: 'text-green-600' };
    return { label: 'INSUFFICIENT', color: 'text-red-600' };
  }

  // スコアバー
  const ScoreBar = ({ label, value, max }: { label: string, value: number, max: number }) => (
    <div className="mb-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded">
        <div
          className="h-3 rounded bg-blue-400"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-10">
      {feedbackList.length === 0 ? <h2 className="text-xl font-bold">No feedback found</h2> :
        <>
          <h2 className="text-3xl font-bold p-10">面接フィードバック</h2>
          {/* 合計点・評価 */}
          <div className="flex items-center gap-8 mb-8">
            <div className="w-48 h-48">
              <CircularProgressbar
                value={totalScore}
                maxValue={maxScore}
                text={`${totalScore} / ${maxScore}`}
                styles={buildStyles({
                  textColor: '#16a34a',
                  pathColor: '#16a34a',
                  trailColor: '#e5e7eb',
                  textSize: '12px',
                })}
              />
            </div>
            <div>
              <div className={`text-2xl font-bold ${getEvaluation(totalScore, maxScore).color}`}>             
                総合評価: {getEvaluation(totalScore, maxScore).label === 'SUFFICIENT' ? <span className="text-green-500">合格</span> : <span className="text-red-500">不合格</span>}
              </div>
              <div className="text-lg mt-2">合計点: <span className="font-bold">{totalScore} / {maxScore}</span></div>
            </div>
          </div>


          {/* 各質問の詳細 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {feedbackList && feedbackList.map((item) => (
              <Collapsible key={item.id} className="mt-2">
                <CollapsibleTrigger className="p-2 flex justify-between bg-secondary my-2 text-left text-xl gap-7 w-full">
                  <h3>{item.question}</h3> <ChevronsDown className="w-5 h-5" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2 p-2">
                    <ScoreBar label="TotalScore" value={item.totalScore} max={CATEGORY_MAX[item.category] ?? 100} />
                    <ScoreBar label="Specificity" value={item.specificityScore} max={30} />
                    <ScoreBar label="Logic" value={item.logicScore} max={25} />
                    <ScoreBar label="STAR構造" value={item.starStructureScore} max={30} />
                    <ScoreBar label="CompanyFit" value={item.companyFitScore} max={40} />
                    <ScoreBar label="Growth" value={item.growthScore} max={25} />
                    <div className="p-2 border rounded-lg bg-red-50 text-sm text-red-900"> <strong>あなたの回答: </strong> {item.answer} </div>
                    <div className="p-2 border rounded-lg bg-blue-50 text-sm text-blue-900"> <strong>フィードバック: </strong> {item.feedback} </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </>
      }
      <Button onClick={() => router.replace('/interview')} className="mt-10">ホームに戻る</Button>
    </div>
  )
}

export default FeedBack
