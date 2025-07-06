import {
  GoogleGenAI,
} from '@google/genai';

export async function GeminiAI(prompt: string, model: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });
  const config = {
    responseMimeType: 'text/plain',
  };

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  });
  let result = '';
  for await (const chunk of response) {
    result += chunk.text;
  }
  return result;
}