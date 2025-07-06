"use client"

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GeminiAIModel, ResearchCompany } from '@/utils/GeminiAIModel';
import { LoaderCircle, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/hono';

// 型定義
type InterviewQA = { category: string; question: string };

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyURL, setCompanyURL] = useState('');
  const [userES, setUserES] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userES.length > 0) {
      setUserES(userES);
    }
  }, [userES]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    const researchPrompt = `# 命令
あなたは、就職活動生を支援する優秀なリサーチアシスタントです。
【${companyName}（${companyURL}）】について分析し、以下の【出力形式】に従って、分析結果をテキストで分かりやすくまとめて。

# 分析の観点
結果をまとめるにあたり、以下の観点を統合的に分析して。
* 事業内容、財務状況、中期経営計画
* 業界構造、競合他社との比較
* SWOT分析（強み、弱み、機会、脅威）
* 採用情報、経営者のメッセージ、企業文化

# 出力形式
* 以下の見出しと箇条書き（\`-\`）の形式を厳守して。
* 各項目は「簡潔なキーワードや短いフレーズ」で記述して。
* 「承知しました」などの返答や、指定された形式以外の文章は含めないで。

---

## 会社概要
- （事業内容の要点1）
- （事業内容の要点2）

## 経営理念
- （経営理念やビジョンの要点1）
- （経営理念やビジョンの要点2）

## 業界での立ち位置
- （属する業界）

## 求められる人材像
- （求められる価値観や姿勢の要点1）
- （求められるスキルの要点1）

## SWOT分析
### 強み (Strengths)
- （具体的な強み1）
- （具体的な強み2）

### 弱み (Weaknesses)
- （具体的な弱み1）
- （具体的な弱み2）

### 機会 (Opportunities)
- （具体的な機会1）
- （具体的な機会2）

### 脅威 (Threats)
- （具体的な脅威1）
- （具体的な脅威2）`;

    const researchResult = await ResearchCompany(researchPrompt);

    const CreateQuestionsPrompt = `# 命令
あなたは、学生の緊張をほぐしながら、的確な評価を行う${companyName}の面接官です。
以下の【入力情報】と【ルール】に従って、面接の質問を合計5問生成してください。

# ルール
- 質問の難易度: 学生が答えやすいよう、シンプルな質問から始めてください。
- 参照情報の制御: 質問を生成する際は、後述のJSONテンプレート内の指示に従い、カテゴリごとに参照する情報を限定してください。

学生の情報(学生時代に頑張ったこと): ${userES}
企業の情報: ${researchResult}

# 出力形式
* 必ず、以下のJSON形式を厳守してください。
* トップレベルのキーは「質問」とし、その値は質問オブジェクトの配列（リスト）にしてください。
* 各質問オブジェクトには、「category」と「question」の2つのキーを含めてください。
* テンプレートに示された5つのカテゴリを、必ず1回ずつ使用してください。
* 「承知しました」などの返答や、JSON以外のテキストは一切含めないでください。

### JSONテンプレート
{
  "質問": [
    {
      "category": "自己紹介",
      "question": "（【情報参照なし】で、自己紹介を促す簡単な質問を生成）"
    },
    {
      "category": "志望動機",
      "question": "（【企業の情報】のみを参照し、会社のどんな点に魅力を感じたかを問う質問を生成）"
    },
    {
      "category": "ESの深掘り",
      "question": "（【学生の情報】のみを参照し、ガクチカの具体的な行動を1つだけ掘り下げる質問を生成）"
    },
    {
      "category": "企業固有の質問",
      "question": "（【企業の情報】のみを参照し、事業内容や社風についてどう思うかを問う質問を生成）"
    },
    {
      "category": "将来性",
      "question": "（【情報参照なし】で、入社後のキャリアに関する簡単な質問を生成）"
    }
  ]
}`;

    const result = await GeminiAIModel(CreateQuestionsPrompt);
    if (typeof result !== 'string') {
      console.error('AIモデルの返却値がstring型ではありません:', result);
      setLoading(false);
      return;
    }
    const InterviewJsonResponse = result.replace('```json', '').replace('```', '');
    let InterviewData: InterviewQA[] = [];
    try {
      InterviewData = JSON.parse(InterviewJsonResponse);
      console.log(InterviewData);
    } catch (err) {
      console.error('JSONパースエラー:', err);
      setLoading(false);
      return;
    }

    if (InterviewData) {
      const response = await client.api.interview.$post({
        json: {
          companyName,
          companyURL,
          companyResearch: researchResult,
          UserES: userES,
          Question: JSON.stringify(InterviewData),
        },
      });

      const data = await response.json();
      if (data && 'interviewId' in data) {
        setOpenDialog(false);
        router.push(`/interview/${data.interviewId}`);
      } else if (data && 'error' in data) {
        alert('面接登録に失敗しました: ' + data.error);
      }
    } else {
      console.log("ERROR");
    }

    setLoading(false);
  }

  return (
    <div>
      {/* トリガー用のボックス */}
      <div
        className="p-10 border rounded-lg hover:scale-105  transition-all duration-300 hover:shadow-md cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <div className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-purple-500" />
          <h2 className="text-lg">面接を始める</h2>
        </div>
      </div>

      {/* ダイアログ本体 */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              面接に必要な情報を入力
            </DialogTitle>
            <DialogDescription>
              企業名、企業URL、学生時代に頑張ったことを入力してください
            </DialogDescription>
          </DialogHeader>

          {/* フォーム部分 */}
          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="font-medium block mb-1">企業名</label>
              <Input placeholder="Enter your job position" required onChange={(e) => setCompanyName(e.target.value)} />
            </div>

            <div>
              <label className="font-medium block mb-1">企業URL</label>
              <Input placeholder="https://www.examples.com" required type="url" onChange={(e) => setCompanyURL(e.target.value)} />
            </div>

            <div className="">
              <label className="font-medium block mb-3">学生時代に頑張ったこと(300字以内)</label>
              <Textarea maxLength={300} required className="min-h-40 mb-1" onChange={(e) => setUserES(e.target.value)} />
              {userES.length < 300 ? <p className="flex justify-end text-sm text-gray-500">{userES.length}/300</p> : <p className="flex justify-end text-sm text-red-500">{userES.length}/300</p>}
            </div>

            <div className="flex gap-5 justify-end pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ?
                  <>
                    <LoaderCircle className="animate-spin" />
                    面接質問を生成中...
                  </>
                  : '面接を開始'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewInterview
