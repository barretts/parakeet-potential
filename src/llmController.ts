import {
  ChatMLChatWrapper,
  getLlama,
  LlamaChatSession,
  resolveModelFile,
} from "node-llama-cpp";
import path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDirectory = path.join(__dirname, "..", "models");

export class LLMController {
  private model: any;
  private llama: any;
  private gmr: any;
  private optionsPrompt: any;

  constructor() { }

  async initialize() {
    const modelPath = await resolveModelFile(
      "HuggingFaceTB.SmolLM2-135M-Instruct.Q8_0.gguf",
      modelsDirectory
    );

    this.llama = await getLlama({
      debug: true,
    });
    this.model = await this.llama.loadModel({ modelPath, ctxSize: 8192 });

    this.optionsPrompt = {
      maxTokens: 2560,
      temperature: 1,
    };
  }

  async initGrammar() {
    const gbnfFilePath = "./boolean.gbnf";
    const gbnfContent = fs.readFileSync(gbnfFilePath, "utf-8");
    this.gmr = await this.llama.createGrammar({ grammar: gbnfContent });

    this.optionsPrompt.grammar = this.gmr;
  }

  async createSession() {
    console.log("createSession");
    this.context = await this.model.createContext();
    console.log("return llamachat sess");
    this.session = new LlamaChatSession({
      contextSequence: this.context.getSequence(),
      chatWrapper: new ChatMLChatWrapper(),
      systemPrompt:
        "Perform the task to the best of your ability. Think about the entire question before you respond.",
    });
  }

  async prompt(question: string, options?: any) {
    return this.session.prompt(question, options || this.optionsPrompt);
  }

  async preloadPrompt(question: string) {
    return this.session.preloadPrompt(question);
  }
}
