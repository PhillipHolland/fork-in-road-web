'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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

  // Prevent zoom on touch for the chat input
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const input = document.getElementById("chat-input");
    if (input) {
      input.addEventListener("touchstart", preventZoom, { passive: false });
      input.addEventListener("touchmove", preventZoom, { passive: false });
    }

    return () => {
      if (input) {
        input.removeEventListener("touchstart", preventZoom);
        input.removeEventListener("touchmove", preventZoom);
      }
    };
  }, []);

  if (!isMounted) {
    return null; // Avoid rendering on the server to prevent hydration issues
  }

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

        .input-section {
          position: sticky;
          bottom: 0;
          background: #fff;
          padding: 10px 0;
          z-index: 100;
        }

        .input-container {
          display: flex;
          align-items: center;
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

          .messages-container {
            padding: 8px;
            margin-bottom: 15px;
          }

          .message {
            padding: 8px 12px;
            margin-bottom: 8px;
            max-width: 85%;
          }

          .input-section {
            padding: 8px 0;
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

      <div className="input-section">
        <form onSubmit={handleSubmit} className="input-container">
          <input
            id="chat-input"
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
    </div>
  );
}