'use client';

import { defaultModel, type modelID } from "@/ai/providers";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { Header } from "./header";
import { toast } from "sonner";
import Image from 'next/image';

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const { messages, input, handleInputChange, handleSubmit, status, stop } = useChat({
    maxSteps: 5,
    body: {
      selectedModel,
    },
    onError: (error) => {
      toast.error(
        error.message.length > 0
          ? error.message
          : "An error occurred, please try again later.",
        { position: "top-center", richColors: true },
      );
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const promptStarters = [
    "Write an email",
    "Identify product brands",
    "Find a better word",
    "Research a purchase",
  ];

  const handlePromptClick = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="chat-container">
      <style jsx>{`
        .chat-container {
          max-width: 850px;
          margin: 0 auto;
          padding: 20px;
          padding-top: 60px; /* Add padding to account for the menu button in the layout */
          background: #fff;
          border-radius: 10px;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          position: relative;
        }

        .header {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header img {
          width: 64px; /* 25% smaller than 85px on home page */
          height: 64px;
          margin-bottom: 10px;
        }

        .prompt-starters {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 10px 0;
          margin-bottom: 10px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .prompt-starters::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }

        .prompt-starter {
          padding: 8px 16px;
          background: #f0f0f0;
          border-radius: 20px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.3s ease;
        }

        .prompt-starter:hover {
          background: #e7cf2c;
          color: #000;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 8px;
          margin-bottom: 20px;
          -webkit-overflow-scrolling: touch;
        }

        .message.user {
          background: #e7cf2c;
          color: #000;
          margin-left: auto;
          text-align: right;
        }

        .message.assistant {
          background: #333;
          color: #fff;
          margin-right: auto;
        }

        .message-content h1 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 12px;
          color: inherit;
        }

        .message-content h2 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: inherit;
        }

        .message-content h3 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
          color: inherit;
        }

        .message-content p {
          margin-bottom: 10px;
        }

        .message-content strong {
          font-weight: bold;
        }

        .message-content em {
          font-style: italic;
        }

        .message-content ul {
          list-style-type: disc;
          margin-left: 20px;
          margin-bottom: 10px;
        }

        .message-content ol {
          list-style-type: decimal;
          margin-left: 20px;
          margin-bottom: 10px;
        }

        .message-content li {
          margin-bottom: 5px;
        }

        .message-content a {
          color: #007bff;
          text-decoration: underline;
        }

        .message-content a:hover {
          color: #0056b3;
        }

        .message-content blockquote {
          border-left: 4px solid #ccc;
          padding-left: 10px;
          margin: 10px 0;
          color: #666;
          font-style: italic;
        }

        .message-content code {
          background: #f4f4f4;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }

        .message-content pre {
          background: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-family: monospace;
          font-size: 13px;
          margin-bottom: 10px;
          white-space: pre-wrap;
        }

        .input-section {
          position: sticky;
          bottom: 0;
          background: #fff;
          padding: 10px 0;
          z-index: 100;
        }

        .textarea-container {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .chat-input {
          flex: 1;
          padding: 10px 40px 10px 10px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 16px !important;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          background: #fff;
          transition: border-color 0.3s ease;
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
        }

        .chat-input:hover {
          border-color: #e7cf2c;
        }

        .send-button {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          padding: 6px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 50%;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          transition: background 0.3s ease;
        }

        .send-button:hover {
          background: #333;
        }

        .send-button:disabled {
          background: #ccc;
          color: #666;
          cursor: not-allowed;
        }

        @media (max-width: 850px) {
          .chat-container {
            padding: 15px;
            padding-top: 50px;
            min-height: 85vh;
          }

          .header img {
            width: 51px;
            height: 51px;
          }

          .messages {
            padding: 8px;
            margin-bottom: 15px;
          }

          .message-content h1 {
            font-size: 18px;
            margin-bottom: 10px;
          }

          .message-content h2 {
            font-size: 16px;
            margin-bottom: 8px;
          }

          .message-content h3 {
            font-size: 14px;
            margin-bottom: 6px;
          }

          .message-content p {
            margin-bottom: 8px;
          }

          .message-content ul,
          .message-content ol {
            margin-left: 15px;
            margin-bottom: 8px;
          }

          .message-content li {
            margin-bottom: 4px;
          }

          .message-content pre {
            padding: 8px;
            font-size: 12px;
          }

          .message-content code {
            font-size: 12px;
          }

          .input-section {
            padding: 8px 0;
          }

          .prompt-starters {
            padding: 8px 0;
            margin-bottom: 8px;
            gap: 8px;
          }

          .prompt-starter {
            padding: 6px 12px;
            font-size: 12px;
          }

          .chat-input {
            padding: 8px 35px 8px 8px;
            font-size: 16px !important;
          }

          .send-button {
            right: 4px;
            width: 26px;
            height: 26px;
            font-size: 12px;
          }

          .send-button svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>

      <div className="header">
        <Image src="/settings512.png" alt="Fork in Road Logo" width={64} height={64} priority />
      </div>

      <Header />

      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} className="messages" />
      )}

      <div className="input-section">
        <div className="prompt-starters">
          {promptStarters.map((prompt, index) => (
            <div
              key={index}
              className="prompt-starter"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="textarea-container">
          <Textarea
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            handleInputChange={handleInputChange}
            input={input}
            isLoading={isLoading}
            status={status}
            stop={stop}
            className="chat-input"
          />
          {input.trim() && (
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !input.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}