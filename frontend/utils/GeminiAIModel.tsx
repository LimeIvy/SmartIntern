import {
  GoogleGenAI,
} from '@google/genai';

// 会社の情報を調べる
export async function ResearchCompany(prompt: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });
  const tools = [
    { urlContext: {} },
  ];
  const config = {
    temperature: 0,
    maxOutputTokens: 1600,
    thinkingConfig: {
      thinkingBudget: -1,
    },
    tools,
    responseMimeType: 'text/plain',
  };
  const model = 'gemini-2.5-flash';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let result = '';
  for await (const chunk of response) {
    result += chunk.text;
  }
  return result;
}

export async function GeminiAIModel(prompt: string, temperature: number): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });
  const config = {
    responseMimeType: 'text/plain',
    temperature: temperature,
  };
  const model = 'gemini-2.0-flash-lite';

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