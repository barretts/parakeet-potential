// src/types.ts
import { LlamaGrammar } from "node-llama-cpp";

export interface PromptOptions {
  maxTokens: number;
  temperature: number;
  grammar?: LlamaGrammar;
}

export interface Email {
  uid?: number;
  subject?: string;
  from?: string;
  date?: Date;
  text?: string;
  score?: any;
  folder?: string;
};

