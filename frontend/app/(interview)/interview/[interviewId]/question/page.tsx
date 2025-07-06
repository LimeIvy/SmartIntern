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

const QuestionsSelection = dynamic(() => import('./_components/QuestionsSelection'))
const RecordAnswerSection = dynamic(() => import('./_components/RecordAnswerSection'), { ssr: false })

type InterviewFromApi = InferResponseType<(typeof client.api.interview)["$get"], 200>[number];

type Question = { category: string; question: string; answer: string }

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

const StartInterview = ({ params }: { params: Promise<{ interviewId: string }> }) => {
  const { interviewId } = React.use(params);
  const [interviewData, setInterviewData] = useState<Interview | null>(null)
  const [interviewQuestion, setInterviewQuestion] = useState<Question[]>([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [webCamEnabled, setWebCamEnabled] = useState(false)

  useEffect(() => {
    const fetchInterview = async () => {
      const res = await client.api.interview[":interviewId"].$get({ param: { interviewId } })
      if (!res.ok) return
      const data = await res.json() as InterviewFromApi
      setInterviewData(data as unknown as Interview)
      try {
        const parsed = JSON.parse(data.Question)
        setInterviewQuestion(parsed.質問 ?? [])
        console.log(parsed.質問)
      } catch {
        setInterviewQuestion([])
      }
    }
    fetchInterview()
  }, [interviewId])

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
              interviewQuestion={interviewQuestion}
              setInterviewQuestion={setInterviewQuestion}
              activeQuestionIndex={activeQuestionIndex}
              setActiveQuestionIndex={setActiveQuestionIndex}
              interviewData={interviewData as Interview}
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
              <Button className="w-full md:w-1/2 bg-green-400 hover:bg-green-500 hover:scale-105 transition-all duration-300" onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
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