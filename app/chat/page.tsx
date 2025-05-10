'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ensure the component is mounted on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to the bottom of the messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isMounted) {
    return null; // Avoid rendering on the server to prevent hydration issues
  }

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
          height: 80vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 8px;
          margin-bottom: 20px;
          -webkit-overflow-scrolling: touch;
        }

        .message {
          padding: 10px 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          max-width: 80%;
          word-wrap: break-word;
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

        .input-container {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
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

        .chat-input {
          flex: 1;
          padding: 10px 40px 10px 10px; /* Adjusted padding-right to account for send button */
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 16px;
          box-sizing: border-box;
          background: #fff;
          transition: border-color 0.3s ease;
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
            padding-top: 50px; /* Adjust for smaller menu button on mobile */
            height: 85vh;
          }

          .messages-container {
            padding: 8px;
            margin-bottom: 15px;
          }

          .message {
            padding: 8px 12px;
            margin-bottom: 8px;
            max-width: 85%;
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
            padding: 8px 35px 8px 8px; /* Adjusted padding-right for mobile */
            font-size: 14px;
          }

          .send-button {
            right: 4px;
            width: 26px;
            height: 26px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="prompt-starters">
        {["Write an email", "Identify product brands", "Find a better word", "Research a purchase"].map((prompt, index) => (
          <div
            key={index}
            className="prompt-starter"
            onClick={() => handlePromptClick(prompt)}
          >
            {prompt}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="chat-input"
          placeholder="Chat with Grok 3"
          disabled={isLoading}
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
  );
}