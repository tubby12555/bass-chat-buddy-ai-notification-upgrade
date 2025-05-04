
import React from "react";
import { ModelTheme } from "@/types/chat";

interface ChatThemeProps {
  currentTheme: ModelTheme;
}

const ChatTheme = ({ currentTheme }: ChatThemeProps) => {
  return (
    <style>
      {`
        :root {
          --chat-bg: ${currentTheme.background};
          --chat-accent: ${currentTheme.accent};
          --chat-highlight: ${currentTheme.highlight};
          --chat-user-msg: ${currentTheme.messageUser};
          --chat-assistant-msg: ${currentTheme.messageAssistant};
        }
        .bg-chat {
          background-color: var(--chat-bg);
        }
        .bg-chat-accent {
          background-color: var(--chat-accent);
        }
        .text-chat-highlight {
          color: var(--chat-highlight);
        }
        .bg-chat-assistant {
          background-color: var(--chat-assistant-msg);
        }
        .border-chat-accent {
          border-color: var(--chat-accent);
        }
        .border-chat-assistant {
          border-color: var(--chat-assistant-msg, #121212);
        }
      `}
    </style>
  );
};

export default ChatTheme;
