import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z, ZodSchema } from "zod";
import {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  BadRequestError,
  OutputValidationError,
} from "@/lib/errors";
import { logger } from "../utils";

interface OpenRouterServiceConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenRouterService {
  private client: ChatOpenAI;
  public readonly DEFAULT_MODEL = "openai/gpt-4o-mini";

  constructor(config: OpenRouterServiceConfig = {}) {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    logger.info("Attempting to load OpenRouter API Key:", apiKey ? "Key Loaded" : "Key Not Found");

    if (!apiKey) {
      throw new AuthenticationError("Brak klucza API OpenRouter. Ustaw zmienną środowiskową OPENROUTER_API_KEY.");
    }

    this.client = new ChatOpenAI({
      apiKey: apiKey,
      modelName: config.modelName || this.DEFAULT_MODEL,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1024,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
    });
  }

  private buildMessages(prompt: string, systemPrompt?: string): BaseMessage[] {
    const messages: BaseMessage[] = [];
    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    messages.push(new HumanMessage(prompt));
    return messages;
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        throw new AuthenticationError("Błąd autentykacji w OpenRouter.");
      }
      if (error.message.includes("429")) {
        throw new RateLimitError("Przekroczono limit zapytań do OpenRouter.");
      }
      if (error.message.includes("400")) {
        throw new BadRequestError("Nieprawidłowe zapytanie do OpenRouter.");
      }
      throw new OutputValidationError(error.message, error);
    }
    throw new OpenRouterError("Nieznany błąd podczas komunikacji z OpenRouter.");
  }

  async getResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const messages = this.buildMessages(prompt, systemPrompt);
      const response = await this.client.invoke(messages);
      return response.content as string;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStructuredResponse<T extends ZodSchema>(
    prompt: string,
    schema: T,
    systemPrompt?: string
  ): Promise<z.infer<T>> {
    try {
      const messages = this.buildMessages(prompt, systemPrompt);
      const structuredClient = this.client.withStructuredOutput(schema);
      const response = await structuredClient.invoke(messages);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }
}
