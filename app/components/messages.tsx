import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked to run synchronously
marked.setOptions({
  async: false,
});

export function Messages({ messages, isLoading, status, className }) {
  const renderMarkdown = (markdown) => {
    const html = marked.parse(markdown) as string;
    const sanitizedHtml = DOMPurify.sanitize(html);
    return { __html: sanitizedHtml };
  };

  return (
    <div className={className}>
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
      {isLoading && (
        <div className="loading-indicator">
          {status === "streaming" ? "Streaming..." : "Thinking..."}
        </div>
      )}
    </div>
  );
}