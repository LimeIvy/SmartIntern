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
    if (results.length > 0) {
      const last = results[results.length - 1];
      if (last !== undefined) {
        if (typeof last === 'string' && last.trim() !== "") {
          setUserAnswer(last);
        } else if (typeof last === 'object' && 'transcript' in last && typeof last.transcript === 'string' && last.transcript.trim() !== "") {
          setUserAnswer(last.transcript);
        }
      }
    }
  }, [results, setUserAnswer]);

  const StartStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
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