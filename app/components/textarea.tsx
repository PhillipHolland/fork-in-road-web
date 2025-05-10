import { useEffect } from "react";

export function Textarea({
  selectedModel,
  setSelectedModel,
  handleInputChange,
  input,
  isLoading,
  status,
  stop,
  className,
}) {
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const textarea = document.getElementById("chat-textarea");
    if (textarea) {
      textarea.addEventListener("touchstart", preventZoom, { passive: false });
      textarea.addEventListener("touchmove", preventZoom, { passive: false });
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("touchstart", preventZoom);
        textarea.removeEventListener("touchmove", preventZoom);
      }
    };
  }, []);

  return (
    <textarea
      id="chat-textarea"
      className={className}
      value={input}
      onChange={handleInputChange}
      placeholder="Chat with Grok 3"
      disabled={isLoading}
      rows={3}
    />
  );
}