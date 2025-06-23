
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

import { interviewAgent } from './agents/interview-agent';
import { feedbackAgent } from './agents/feedback-agent';

export const mastra = new Mastra({ 
  agents: { interviewAgent, feedbackAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
