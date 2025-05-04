
export type ModelType = "qwen" | "gemini" | "openai" | "pwned";

export interface ModelTheme {
  background: string;
  accent: string;
  highlight: string;
  messageUser: string;
  messageAssistant: string;
  name: string;
  description: string;
  icon: string;
}

export const MODEL_THEMES: Record<ModelType, ModelTheme> = {
  qwen: {
    background: "#000000",
    accent: "#8B5CF6",
    highlight: "#1EAEDB",
    messageUser: "#000000",
    messageAssistant: "#121212",
    name: "Qwen",
    description: "General purpose assistant",
    icon: "bot"
  },
  gemini: {
    background: "#0D0D0D",
    accent: "#00A67E",
    highlight: "#1EC1CF",
    messageUser: "#0D0D0D",
    messageAssistant: "#151515",
    name: "Gemini",
    description: "Google's creative AI",
    icon: "sparkles"
  },
  openai: {
    background: "#050505",
    accent: "#10A37F",
    highlight: "#10B981",
    messageUser: "#050505",
    messageAssistant: "#121212",
    name: "OpenAI",
    description: "Powerful language model",
    icon: "message-square"
  },
  pwned: {
    background: "#080808",
    accent: "#FF3636",
    highlight: "#FF5757",
    messageUser: "#0A0A0A",
    messageAssistant: "#121212",
    name: "Pwned",
    description: "Cybersecurity specialist",
    icon: "skull"
  }
};
