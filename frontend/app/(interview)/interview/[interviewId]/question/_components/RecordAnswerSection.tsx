'use client';
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';
import { GeminiAIModel } from '@/utils/GeminiAIModel';

type Interview = {
  interviewId: string
  UserES: string
  createdAt: Date
  companyName: string
  companyURL: string
  companyResearch: string
  userId: string
  id: string
  Question: string
}

type Question = {
  category: string;
  question: string;
  answer: string;
};

// カテゴリ別評価基準とプロンプト
const CATEGORY_CONFIGS = {
  '自己紹介': {
    weightings: { specificity: 30, logic: 20, starStructure: 25, companyFit: 10, growth: 15 },
    keyPoints: ['具体的な経験や強み', 'エピソードの構造', '人柄の表現'],
  },
  '志望動機': {
    weightings: { specificity: 15, logic: 25, starStructure: 15, companyFit: 35, growth: 10 },
    keyPoints: ['企業研究の深さ', '論理的な理由', '熱意の表現'],
  },
  'ESの深掘り': {
    weightings: { specificity: 25, logic: 20, starStructure: 30, companyFit: 10, growth: 15 },
    keyPoints: ['STAR形式での説明', '具体的な行動', '成果と学び'],
  },
  '企業固有の質問': {
    weightings: { specificity: 10, logic: 25, starStructure: 10, companyFit: 40, growth: 15 },
    keyPoints: ['業界・企業知識', '独自の視点', '将来性の理解'],
  },
  '将来性': {
    weightings: { specificity: 15, logic: 25, starStructure: 15, companyFit: 20, growth: 25 },
    keyPoints: ['キャリアビジョン', '成長意欲', '企業での活かし方'],
  }
};

const RecordAnswerSection = ({ interviewQuestion, activeQuestionIndex, interviewData }: { interviewQuestion: Question[], activeQuestionIndex: number, interviewData: Interview }) => {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  useEffect(() => {
    results.forEach((result) => {
      if (typeof result === 'string') {
        setUserAnswer(prevAnswer => prevAnswer + result);
      } else if ('transcript' in result) {
        setUserAnswer(prevAnswer => prevAnswer + result.transcript);
      }
    });
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer?.length > 10) {
      UpdateUserAnswer();
    }
    if (userAnswer?.length > 0 && userAnswer?.length < 10) {
      setIsLoading(false);
      toast.error('10文字以上話してください');
      return;
    }
  }, [userAnswer]);

  const StartStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  }

  const UpdateUserAnswer = async () => {
    setIsLoading(true);
    const config = CATEGORY_CONFIGS[interviewQuestion[activeQuestionIndex]?.category as keyof typeof CATEGORY_CONFIGS];
    const feedbackPrompt = `
# 面接評価
${interviewQuestion[activeQuestionIndex]?.category}回答評価
あなたは経験豊富な面接官です。以下の入力と基準に基づき、ユーザーの回答を評価・採点し、指定されたJSON形式で出力してください。

入力
企業: ${interviewData.companyName}

企業情報: ${interviewData.companyResearch}

質問: ${interviewQuestion[activeQuestionIndex]?.question}

回答: ${userAnswer}

評価基準
合計点が60点未満の場合は評価を「INSUFFICIENT」とする。

具体性 (${config.weightings.specificity}点): 具体的なエピソード、数値、詳細。曖昧表現の少なさ。

論理性 (${config.weightings.logic}点): 結論→根拠→具体例の構成。明確な因果関係。

STAR形式構造 (${config.weightings.starStructure}点): Situation, Task, Action, Resultの明確さ。

企業適合性 (${config.weightings.companyFit}点): 企業理解、質問意図との合致。

成長・学習 (${config.weightings.growth}点): 経験からの学び、自己分析、今後の活用。

出力フォーマット
必ず以下のJSON形式で回答すること。

評価が「INSUFFICIENT」の場合のみ、回答の弱点を補い改善を促すための具体的な深掘り質問を1つ、followUpQuestionsキーに追加すること。

{
  "evaluation": "SUFFICIENT" | "INSUFFICIENT",
  "totalScore": 0,
  "specificityScore": 0,
  "logicScore": 0,
  "starStructureScore": 0,
  "companyFitScore": 0,
  "growthScore": 0,
  "feedback": "（評価の根拠となる具体的なフィードバック）",
  "followUpQuestions": ""
}
`;


    const result = await GeminiAIModel(feedbackPrompt, 0.1);

    const mockJsonResp = (result.replace('```json', '').replace('```', ''))
    console.log(mockJsonResp);
    const JsonFeedbackResp = JSON.parse(mockJsonResp);

    const resp = await fetch(`/api/interview/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewId: interviewData.id,
        question: interviewQuestion[activeQuestionIndex]?.question ?? "",
        answer: userAnswer,
        totalScore: JsonFeedbackResp.totalScore,
        specificityScore: JsonFeedbackResp.specificityScore,
        logicScore: JsonFeedbackResp.logicScore,
        starStructureScore: JsonFeedbackResp.starStructureScore,
        companyFitScore: JsonFeedbackResp.companyFitScore,
        growthScore: JsonFeedbackResp.growthScore,
        feedback: JsonFeedbackResp.feedback,
      }),
    });

    if (resp.ok) {
      toast.success('回答を更新しました');
      setUserAnswer('');
      setResults([]);
    } else {
      toast.error('回答を更新できませんでした');
    }
    setResults([]);
    setIsLoading(false);
  }

  return (
    <Button
      disabled={isLoading}
      onClick={StartStopRecording}
      className="w-full h-10 hover:scale-102 transition-all duration-300 bg-primary text-white"
    >
      {isRecording ?
        <h2 className="text-red-600 flex gap-2">
          <Mic />録音を停止中...
        </h2>
        :
        <h2 className="text-sm flex gap-2">
          <Mic />回答を録音する
        </h2>
      }
    </Button>
  )
}

export default RecordAnswerSection