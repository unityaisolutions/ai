export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Sonoma Dusk Alpha",
    description: "Advanced multimodal vision model with text capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Grok 4 Fast Reasoning",
    description:
      "Fast reasoning model with chain-of-thought for complex problems",
  },
];
