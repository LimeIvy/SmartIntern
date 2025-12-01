'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Webcam from 'react-webcam';
import { Lightbulb, Video } from 'lucide-react'
import Image from 'next/image';
import AudioTest from '../_components/AudioTest';

const InterviewDetails = ({ params }: { params: Promise<{ interviewId: string }> }) => {
  const { interviewId } = React.use(params);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [audioTestCompleted, setAudioTestCompleted] = useState(false);
  const [micWorking, setMicWorking] = useState(false);
  const [speakerWorking, setSpeakerWorking] = useState(false);

  // オーディオテスト完了時のコールバック
  const handleAudioTestComplete = (micResult: boolean, speakerResult: boolean) => {
    setMicWorking(micResult);
    setSpeakerWorking(speakerResult);
    setAudioTestCompleted(true);
  };

  // 面接開始の準備が整っているかチェック
  const isReadyToStart = audioTestCompleted && micWorking && speakerWorking;

  return (
    <div className="p-10">
      <h2 className="text-2xl sm:text-3xl font-bold ml-10">面接準備</h2>
      <div className="flex flex-col gap-10 mt-10">


        {/* カメラセクション */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">1.カメラテスト</h3>
          <div className="flex items-start justify-center gap-10">
            {/* 左側：自分のカメラ */}
            <div className="flex flex-col items-center gap-5 w-1/2">
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

              <div className="space-y-3 w-full flex justify-center">
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
              <div className="w-full aspect-[4/3]">
                <Image
                  src="/images/interviewer.png"
                  alt="interview"
                  width={1408}
                  height={768}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 text-center text-sm text-gray-600">
                AI面接官
              </div>
            </div>
          </div>
        </div>

        {/* オーディオテストセクション */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">2.音声テスト</h3>
          <AudioTest onTestComplete={handleAudioTestComplete} />
        </div>

      </div>

      <div className="flex flex-col my-5 gap-5 ">
        <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-50">
          <h2 className="flex items-center gap-2 text-yellow-500"><Lightbulb /> <strong>Information</strong></h2>
          <h2 className="mt-3 text-yellow-500">AI生成模擬面接を開始するために、カメラとマイクを有効にしてください。</h2>
          <h2 className="mt-1 text-yellow-500"><strong>注意：ビデオを録画することはありません。カメラはいつでも無効にできます。</strong></h2>
        </div>
      </div>

      <div className="mt-10 flex justify-center items-center">
        {isReadyToStart ? (
        <Link href={`/interview/${interviewId}/question`}>
          <Button
            className="w-full h-12 text-lg px-8 py-4 transition-all duration-300 bg-blue-500 hover:bg-blue-600 hover:scale-105"
          >
            面接を開始する
          </Button>
        </Link>
        ) : (
          <Button
            className="w-full transition-all duration-300 bg-gray-400"
            disabled={true}
          >
            すべての準備を完了してください
          </Button>
        )}
      </div>
    </div>
  )
}

export default InterviewDetails