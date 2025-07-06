'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import Webcam from 'react-webcam'
import Image from 'next/image'
import { ArrowRight, Video } from 'lucide-react'
import dynamic from 'next/dynamic'
import { GeminiAIModel } from '@/utils/GeminiAIModel'
import { toast } from 'sonner';

const QuestionsSelection = dynamic(() => import('./_components/QuestionsSelection'))
const RecordAnswerSection = dynamic(() => import('./_components/RecordAnswerSection'), { ssr: false })

type InterviewFromApi = InferResponseType<(typeof client.api.interview)["$get"], 200>[number];

type Question = { category: string; question: string; answer: string; followUpCount?: number }

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

// カテゴリ別評価基準
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

const StartInterview = ({ params }: { params: Promise<{ interviewId: string }> }) => {
  const { interviewId } = React.use(params);
  const [interviewData, setInterviewData] = useState<Interview | null>(null)
  const [interviewQuestion, setInterviewQuestion] = useState<Question[]>([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [webCamEnabled, setWebCamEnabled] = useState(false)
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      const res = await client.api.interview[":interviewId"].$get({ param: { interviewId } })
      if (!res.ok) return
      const data = await res.json() as InterviewFromApi
      setInterviewData(data as unknown as Interview)
      try {
        const parsed = JSON.parse(data.Question)
        setInterviewQuestion(parsed.質問 ?? [])
      } catch {
        setInterviewQuestion([])
      }
    }
    fetchInterview()
  }, [interviewId])

  // 保存・AIフィードバック生成・followUpロジック
  const handleSaveAndFeedback = async () => {
    setIsLoading(true);
    const currentQ = interviewQuestion[activeQuestionIndex];
    if (!interviewData || !currentQ || !userAnswer) {
      setIsLoading(false);
      return;
    }
    // AI評価プロンプト生成
    const config = CATEGORY_CONFIGS[currentQ.category as keyof typeof CATEGORY_CONFIGS];
    const feedbackPrompt = `
# 面接評価
${currentQ.category}回答評価
あなたは経験豊富な面接官です。以下の入力と基準に基づき、ユーザーの回答を評価・採点し、指定されたJSON形式で出力してください。

入力
企業: ${interviewData.companyName}

企業情報: ${interviewData.companyResearch}

質問: ${currentQ.question}

回答: ${userAnswer}

評価基準
合計点が70点未満の場合は評価を「INSUFFICIENT」とする。

具体性 (${config.weightings.specificity}点): 具体的なエピソード、数値、詳細。曖昧表現の少なさ。

論理性 (${config.weightings.logic}点): 結論→根拠→具体例の構成。明確な因果関係。

STAR形式構造 (${config.weightings.starStructure}点): Situation, Task, Action, Resultの明確さ。

企業適合性 (${config.weightings.companyFit}点): 企業理解、質問意図との合致。

成長・学習 (${config.weightings.growth}点): 経験からの学び、自己分析、今後の活用。

出力フォーマット
必ず以下のJSON形式で回答すること。

回答を深掘る具体的な質問を1つ、followUpQuestionsキーに追加すること。

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
    const resultJsonResp = (result.replace('```json', '').replace('```', ''));
    const JsonFeedbackResp = JSON.parse(resultJsonResp);
    console.log("JsonFeedbackResp", JsonFeedbackResp);
    // 保存API呼び出し
    const resp = await fetch(`/api/interview/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewId: interviewData.id,
        question: currentQ.question,
        answer: userAnswer,
        totalScore: JsonFeedbackResp.totalScore,
        specificityScore: JsonFeedbackResp.specificityScore,
        logicScore: JsonFeedbackResp.logicScore,
        starStructureScore: JsonFeedbackResp.starStructureScore,
        companyFitScore: JsonFeedbackResp.companyFitScore,
        growthScore: JsonFeedbackResp.growthScore,
        feedback: JsonFeedbackResp.feedback,
        followUpQuestion: JsonFeedbackResp.followUpQuestions,
      }),
    });
    if (resp.ok) {
      // 成功時
      setUserAnswer("");
    }
    // followUpロジック
    const currentFollowUpCount = currentQ.followUpCount ?? 0;
    if (
      JsonFeedbackResp.evaluation === "INSUFFICIENT" &&
      JsonFeedbackResp.followUpQuestions &&
      currentFollowUpCount < 2
    ) {
      const followUpText = JsonFeedbackResp.followUpQuestions;
      const followUp: Question = {
        category: currentQ.category,
        question: followUpText,
        answer: "",
        followUpCount: currentFollowUpCount + 1,
      };
      const newQuestions = [
        ...interviewQuestion.slice(0, activeQuestionIndex + 1),
        followUp,
        ...interviewQuestion.slice(activeQuestionIndex + 1),
      ];
      setInterviewQuestion(newQuestions);
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-10">
      <div className=" flex justify-end gap-2 mr-5">
        <h1 className="text-2xl">質問数 {activeQuestionIndex + 1} / 10 問</h1>
      </div>
      <div className="flex items-start justify-center gap-10 mt-5">
        {/* 左側：自分のカメラ */}
        <div className="flex flex-col items-center w-1/2">
          <div className="w-full aspect-[4/3] bg-secondary border flex items-center justify-center">
            {webCamEnabled ? (
              <Webcam
                audio={false}
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => setWebCamEnabled(false)}
                mirrored={true}
                className="w-full h-full object-cover"
              />
            ) : (
              <Video className="w-1/3 h-1/3 text-gray-400" />
            )}
          </div>
          <div className="mt-5 w-full">
            <RecordAnswerSection
              setUserAnswer={setUserAnswer}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-5 w-full flex justify-center">
            {!webCamEnabled && (
              <Button
                className="w-full md:w-1/2 bg-green-400 hover:bg-green-500 hover:scale-105 transition-all duration-300"
                onClick={() => setWebCamEnabled(true)}
              >
                Webカメラを有効にする
              </Button>
            )}
          </div>
        </div>

        {/* 右側：面接官の画像 */}
        <div className="w-1/2">
          <div className="w-full aspect-[4/3] relative">
            <Image
              src="/images/interviewer.png"
              alt="interview"
              width={1408}
              height={768}
              className="w-full h-full object-cover"
            />
            <div className="absolute left-0 bottom-0 text-white text-sm bg-black/60 px-3 py-1">
              面接官
            </div>
          </div>
          <div className="mt-5 text-center">
            <QuestionsSelection interviewQuestion={interviewQuestion} activeQuestionIndex={activeQuestionIndex} />
          </div>
          <div className="mt-5 flex justify-center">
            {activeQuestionIndex < 9 && (
              <Button
                className="w-full md:w-1/2 bg-green-400 hover:bg-green-500 hover:scale-105 transition-all duration-300"
                onClick={() => {
                  console.log("userAnswer", userAnswer);
                  if (userAnswer.length < 10) {
                    toast.error('10文字以上話してください');
                    return;
                  }
                  handleSaveAndFeedback();
                }}
                disabled={isLoading}
              >
                <ArrowRight className="w-4 h-4" />
                次の質問へ進む
              </Button>
            )}
            {activeQuestionIndex === 9 && (
              <Link href={`/interview/${interviewId}/feedback`}>
                <Button className="w-full md:w-1/2 bg-red-400 hover:bg-red-500 hover:scale-105 transition-all duration-300" >面接を終了する</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>

  )
}

export default StartInterview