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
  question: string;
  answer: string;
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
    const feedbackPrompt = "【面接評価】\n" +
      "質問: " + interviewQuestion[activeQuestionIndex]?.question + "\n" +
      "応募者の回答: " + userAnswer + "\n\n" +
      "あなたは経験豊富な面接官です。上記の質問に対する応募者の回答を評価してください。\n" +
      "評価ポイント:\n" +
      "- 質問への適切な回答ができているか\n" +
      "- 具体例や経験が含まれているか\n" +
      "- 論理的で分かりやすい説明か\n" +
      "- 熱意や人柄が伝わるか\n\n" +
      "10点満点で評価し、改善点や良い点を含む建設的なフィードバックを3〜5行で提供してください。\n" +
      "必ずJSON形式で以下の形で回答してください：\n" +
      '{"rating": 数値, "feedback": "フィードバック文"}';

    const result = await GeminiAIModel(feedbackPrompt);

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