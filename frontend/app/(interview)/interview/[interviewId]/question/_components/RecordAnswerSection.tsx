'use client';
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react';

const RecordAnswerSection = ({ setUserAnswer, isLoading }: {
  setUserAnswer: React.Dispatch<React.SetStateAction<string>>,
  isLoading: boolean
}) => {
  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
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
    console.log("userAnswer", results);
  }, [results, setUserAnswer]);

  const StartStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      setUserAnswer("");
      startSpeechToText();
    }
  };

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