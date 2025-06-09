import { google } from "@ai-sdk/google";
import { createOllama } from "ollama-ai-provider";
import { Agent } from "@mastra/core/agent";
import { MCPConfiguration } from "@mastra/mcp";

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || "";

const ollama = createOllama({
  baseURL: "http://localhost:11434/api",
});

const chat = ollama.chat("llama3-groq-tool-use:8b", {
  simulateStreaming: true,
});

const mcp = new MCPConfiguration({
  servers: {
    // stdio example
    github: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: {
        BRAVE_API_KEY,
      },
    },
  },
});

export const mcpAgent = new Agent({
  name: "MCP Agent",
  instructions: `
      あなたはウェブ検索ができる便利なアシスタントです。
      すべて日本語で回答してください。

      【情報を求められた場合】
      webSearchToolを使用してウェブ検索を実行してください。webSearchToolは以下のパラメータを受け付けます：
      - query: 検索クエリ（必須）
      - country: 検索結果の国コード（例: JP, US）（オプション）
      - count: 返される検索結果の最大数（オプション）
      - search_lang: 検索言語（例: ja, en）（オプション）

      回答は常に簡潔ですが情報量を保つようにしてください。ユーザーの質問に直接関連する情報を優先して提供してください。
  `,
  /* model: google("gemini-2.0-flash"),  */
  model: chat,
  tools: await mcp.getTools(),
});
