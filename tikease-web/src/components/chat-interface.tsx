"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Plugin for GitHub Flavored Markdown (tables, etc.)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, User, Bot, AlertTriangle } from "lucide-react"; // Added icons

export default function ChatInterface() {
  let event_id = localStorage.getItem("EventId")  ; // Assuming event_id is passed as a prop or context
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error, // Get the error state
    reload, // Function to retry last submission
    stop, // Function to stop generation
  } = useChat({
    api: `/api/chat/${event_id}`,
    maxSteps: 5, // Keep consistent with backend
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi there! I'm your event assistant. How can I help you with Tech Conference 2025?",
      },
    ],
    // onError can be used for side-effects like logging, but we'll display the error state directly
    // onError: (err) => {
    //   console.error("Chat error:", err);
    //   // Maybe show a toast notification here
    // },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);


  // Scroll to bottom when messages change or loading state appears/disappears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);


  // Render message content using Markdown
  const renderMessageContent = (content: string | null | undefined) => {
    if (!content) return null;
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none break-words"> {/* Added prose styling + break-words */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ // Customize rendering if needed
            // Example: open links in new tab
            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Chat Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar/Icon */}
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot size={20} className="text-muted-foreground" />
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {renderMessageContent(message.content)}
              {/* In a truly advanced UI with client-side tools,
                  you might render message.parts here, checking part.type
                  to display specific UI for tool calls/results.
                  Since our tools are server-side and results integrated into text,
                  rendering content with Markdown covers most cases. */}
            </div>

             {/* Avatar/Icon */}
             {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User size={20} className="text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot size={20} className="text-muted-foreground" />
              </div>
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted text-muted-foreground">
              <div className="flex items-center space-x-2">
                 <span>Assistant is thinking</span>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
                 {/* Optional: Add stop button during generation */}
                 <Button variant="ghost" size="sm" onClick={stop} className="ml-4 text-xs">Stop</Button>
              </div>
            </div>
          </div>
        )}

         {/* Error Display */}
         {error && (
            <div className="flex items-center gap-3 justify-center text-destructive p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                 <AlertTriangle size={20} />
                 <div className="flex-1">
                    <p className="font-semibold">An error occurred:</p>
                    <p className="text-sm">{error.message || 'Please try again.'}</p>
                    {/* Provide a retry mechanism */}
                    <Button variant="destructive" size="sm" onClick={() => reload()} className="mt-2">
                        Retry Last Message
                    </Button>
                 </div>
            </div>
        )}

        {/* Invisible div to measure scroll position */}
        <div ref={messagesEndRef} style={{ height: '1px' }}/>
      </div>

      {/* Input Form Area */}
      <form onSubmit={handleSubmit} className="border-t p-3 flex items-center gap-2 bg-background">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about the event or tickets..."
          className="flex-1 bg-muted border-border focus:ring-primary"
          disabled={isLoading}
          aria-label="Chat input"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <SendIcon size={18} />
        </Button>
      </form>
    </div>
  );
}