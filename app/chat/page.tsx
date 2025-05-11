'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked to run synchronously
marked.setOptions({
  async: false,
});

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

  // Convert markdown to HTML and sanitize it (synchronous)
  const renderMarkdown = (markdown: string) => {
    const html = marked.parse(markdown) as string;
    const sanitizedHtml = DOMPurify.sanitize(html);
    return { __html: sanitizedHtml };
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

        .header {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header img {
          width: 85px;
          height: 85px;
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
          transition: border-color 0.3s ease;
        }

        .chat-input:hover {
          border-color: #e7cf2c;
        }

        .send-button {
          padding: 10px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          cursor: pointer;
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

          .header img {
            width: 68px;
            height: 68px;
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

          .chat-input {
            padding: 8px;
            font-size: 14px;
          }

          .send-button {
            padding: 8px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="header">
        <Image src="/settings512.png" alt="Fork in Road Logo" width={85} height={85} priority />
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div
              className="message-content"
              dangerouslySetInnerHTML={renderMarkdown(message.content)}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
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
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}