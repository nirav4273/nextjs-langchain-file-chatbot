'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  filename?: string;
}

export const ChatInterface = forwardRef<{ resetMessages: () => void }, ChatInterfaceProps>(
  ({ filename }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! Upload a PDF and I\'ll help you with questions about it.',
        timestamp: new Date(),
      },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Expose reset method to parent
    useImperativeHandle(ref, () => ({
      resetMessages: () => {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! Upload a PDF and I\'ll help you with questions about it.',
            timestamp: new Date(),
          },
        ]);
      },
    }));

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || !filename) return;

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        // Call chat API with filename
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input, filename }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || 'No response received',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`w-[85%] lg:w-[90%] px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: (props) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: (props) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        li: (props) => <li className="ml-2" {...props} />,
                        code: (props) => {
                          const { inline, children } = props as { inline?: boolean; children?: React.ReactNode };
                          return inline ? (
                            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded mb-2 overflow-x-auto">
                              {children}
                            </code>
                          );
                        },
                        blockquote: (props) => (
                          <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-2 italic mb-2" {...props} />
                        ),
                        h1: (props) => <h1 className="text-lg font-bold mb-2" {...props} />,
                        h2: (props) => <h2 className="text-base font-bold mb-1" {...props} />,
                        h3: (props) => <h3 className="text-sm font-bold mb-1" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !filename}
              placeholder={filename ? 'Ask a question...' : 'Upload a PDF first...'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !filename}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold text-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }
);

ChatInterface.displayName = 'ChatInterface';