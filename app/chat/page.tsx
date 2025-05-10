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

  return (
    <div className="chat-container">
      <style jsx>{`
        .chat-container {
          max-width: 850px;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          height: 80vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .chat-header {
          font-size: 20px;
          font-weight: bold;
          color: #000;
          margin-bottom: 20px;
          text-align: center;
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
        }

        .chat-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 16px;
          box-sizing: border-box;
          background: #fff;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: box-shadow 0.3s ease;
        }

        .chat-input:hover {
          box-shadow: 0 2px 8px rgba(32, 33, 36, 0.4);
        }

        .send-button {
          padding: 10px 20px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: background 0.3s, box-shadow 0.3s ease;
        }

        .send-button:hover {
          background: #333;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .send-button:disabled {
          background: #ccc;
          color: #666;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 850px) {
          .chat-container {
            padding: 15px;
            height: 85vh;
          }

          .chat-header {
            font-size: 18px;
            margin-bottom: 15px;
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

          .chat-input {
            padding: 8px;
            font-size: 14px;
          }

          .send-button {
            padding: 8px 15px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="chat-header">Chat with Grok</div>

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

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="chat-input"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}