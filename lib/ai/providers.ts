import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": gateway.languageModel("stealth/sonoma-dusk-alpha"),
        "chat-model-reasoning": wrapLanguageModel({
          model: gateway.languageModel("xai/grok-4-fast-reasoning"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "chat-model-image-gen": gateway.languageModel("google/gemini-2.5-flash-image-preview"),
        "title-model": gateway.languageModel("xai/grok-2-1212"),
        "artifact-model": gateway.languageModel("google/gemini-2.5-flash-image-preview"),
        "image-generation-agent": gateway.languageModel("google/gemini-2.5-flash-image-preview"),
      },
    });
