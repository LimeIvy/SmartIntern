'use client'
import React, { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Question = {
  question: string;
  answer: string;
};

const QuestionsSelection = ({ interviewQuestion, activeQuestionIndex }: { interviewQuestion: Question[], activeQuestionIndex: number }) => {

  const [isLoading, setIsLoading] = useState(false);

  // 🆕 追加: キャッシュ用のstate
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());

  const textToSpeech = async (text: string) => {
    // 🆕 追加: キャッシュから即座に再生
    if (audioCache.has(text)) {
      const audioUrl = audioCache.get(text)!;
      const audio = new Audio(audioUrl);
      audio.play();
      console.log('audioCache');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // 🆕 追加: キャッシュに保存
      setAudioCache(prev => new Map(prev.set(text, audioUrl)));

      const audio = new Audio(audioUrl);

      audio.oncanplaythrough = () => {
        audio.play().catch(console.error);
      };

      audio.onerror = () => {
        throw new Error('Audio playback failed');
      };

      audio.load();

    } catch (error) {
      console.error('Gemini TTS Error:', error);
      // エラー時は標準TTSを使用
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'ja-JP';
      speech.rate = 1.5;
      window.speechSynthesis.speak(speech);
    }

    setIsLoading(false);
  }

  return interviewQuestion && (
    <Button
      className="w-full h-10 hover:scale-102 transition-all duration-300"
      onClick={() => {
        textToSpeech(interviewQuestion[activeQuestionIndex]?.question ?? "")
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <Volume2 />
      )}
      <h2 className="text-sm">質問を再生する</h2>
    </Button>
  )
}

export default QuestionsSelection