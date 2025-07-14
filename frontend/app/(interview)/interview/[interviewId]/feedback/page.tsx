'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import { ChevronsDown, CheckCircle, AlertCircle, TrendingUp, Target, Star, Building, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { client } from "@/lib/hono";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CATEGORY_CONFIGS } from '@/data/category-config';
import { LucideIcon } from 'lucide-react';

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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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

  // 合計点から評価（改善版）
  const getEvaluation = (score: number, max: number) => {
    const rate = (score / max) * 100;
    if (rate >= 80) return { label: '優秀', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
    if (rate >= 70) return { label: '合格', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle };
    if (rate >= 50) return { label: '改善の余地あり', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle };
    return { label: '要改善', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle };
  }

  // スコアの色を取得
  const getScoreColor = (score: number, max: number) => {
    const rate = (score / max) * 100;
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // スコアバー（改善版）
  const ScoreBar = ({ label, value, max, icon: Icon }: { label: string, value: number, max: number, icon: LucideIcon }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center text-sm mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-gray-600">{value} / {max}</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${getScoreColor(value, max)}`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );

  // 改善すべき上位項目を取得
  const getImprovementPriorities = () => {
    const scores = feedbackList.flatMap(item => [
      { name: 'Specificity', score: item.specificityScore, max: 30, item: item.question },
      { name: 'Logic', score: item.logicScore, max: 25, item: item.question },
      { name: 'STAR構造', score: item.starStructureScore, max: 30, item: item.question },
      { name: 'CompanyFit', score: item.companyFitScore, max: 40, item: item.question },
      { name: 'Growth', score: item.growthScore, max: 25, item: item.question }
    ]);
    
    return scores
      .map(s => ({ ...s, rate: (s.score / s.max) * 100 }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3);
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }

  const evaluation = getEvaluation(totalScore, maxScore);
  const EvaluationIcon = evaluation.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {feedbackList.length === 0 ? 
          <h2 className="text-xl font-bold">No feedback found</h2> :
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              面接フィードバック
            </h1>

            {/* 総合評価セクション（改善版） */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center">
                  <div className="w-56 h-56 md:w-64 md:h-64">
                    <CircularProgressbar
                      value={totalScore}
                      maxValue={maxScore}
                      text={`${totalScore} / ${maxScore}`}
                      styles={buildStyles({
                        textColor: evaluation.color.replace('text-', '#'),
                        pathColor: evaluation.color.replace('text-', '#'),
                        trailColor: '#e5e7eb',
                        textSize: '14px',
                        strokeLinecap: 'round',
                      })}
                    />
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className={`inline-flex items-center gap-3 ${evaluation.bgColor} rounded-full px-6 py-3 mb-4`}>
                    <EvaluationIcon className={`w-6 h-6 ${evaluation.color}`} />
                    <span className={`text-xl font-bold ${evaluation.color}`}>
                      総合評価: {evaluation.label}
                    </span>
                  </div>
                  
                  <div className="text-lg text-gray-600 mb-4">
                    合計点: <span className="font-bold text-2xl text-gray-900">{totalScore} / {maxScore}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    スコア達成率: {Math.round((totalScore / maxScore) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 改善優先度セクション */}
            {feedbackList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  改善優先度
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getImprovementPriorities().map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="text-sm text-gray-600">{Math.round(item.rate)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${getScoreColor(item.score, item.max)}`}
                          style={{ width: `${item.rate}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {item.item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 各質問の詳細（改善版） */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">質問別詳細フィードバック</h2>
              
              {feedbackList && feedbackList.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {item.question}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-600">
                            {item.totalScore} / {CATEGORY_MAX[item.category] ?? 100}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((item.totalScore / (CATEGORY_MAX[item.category] ?? 100)) * 100)}%
                          </div>
                        </div>
                        <ChevronsDown 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedItems.includes(item.id) ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {expandedItems.includes(item.id) && (
                    <div className="px-6 pb-6 border-t bg-gray-50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">評価詳細</h4>
                          <ScoreBar label="総合スコア" value={item.totalScore} max={CATEGORY_MAX[item.category] ?? 100} icon={Target} />
                          <ScoreBar label="具体性" value={item.specificityScore} max={30} icon={Star} />
                          <ScoreBar label="論理性" value={item.logicScore} max={25} icon={Zap} />
                          <ScoreBar label="STAR構造" value={item.starStructureScore} max={30} icon={TrendingUp} />
                          <ScoreBar label="企業適合性" value={item.companyFitScore} max={40} icon={Building} />
                          <ScoreBar label="成長性" value={item.growthScore} max={25} icon={TrendingUp} />
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">フィードバック</h4>
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <h5 className="font-medium text-blue-900 mb-2">あなたの回答</h5>
                              <p className="text-sm text-blue-800">{item.answer}</p>
                            </div>
                            
                            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                              <h5 className="font-medium text-green-900 mb-2">改善提案</h5>
                              <p className="text-sm text-green-800">{item.feedback}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        }
        
        {/* アクションボタン（改善版） */}
        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => router.replace('/interview')} 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FeedBack