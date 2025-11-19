import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Wifi, WifiOff, MessageSquare } from 'lucide-react';

const ChatWidget = ({ messages, onSendMessage, isTyping, isConnected, streamingMessage, onStartNewSession, onLoadPreviousSession, currentSessionId }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle streaming message updates
  useEffect(() => {
    if (streamingMessage) {
      scrollToBottom();
    }
  }, [streamingMessage]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur-xl">
      <style>{`
        @keyframes typing-wave {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
        .typing-dot {
          animation: typing-wave 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        .typing-dot:nth-child(3) { animation-delay: 0s; }
      `}</style>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Chat Assistant</h2>
            <p className="text-xs text-white/50">
              {isConnected ? "Ready to chat" : "Connecting..."}
            </p>
            {currentSessionId && (
              <p className="text-xs text-white/40 mt-1 font-mono">
                Session: {currentSessionId.slice(-8)}...
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/40">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-white/30"
              }`}
            />
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi size={16} className="text-emerald-400" />
            ) : (
              <WifiOff size={16} className="text-white/30" />
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-6 py-6">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 && !streamingMessage && !isTyping ? (
            <div className="flex h-full items-center justify-center px-6">
              <p className="text-sm text-white/60 text-center">
                Pick an assistant on the left, then start chatting.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-white/5 text-emerald-400 border border-white/10'
                        : 'bg-white/5 text-white border border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'bot' && (
                        <Bot size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${
                          message.type === 'user' ? 'text-emerald-400' : 'text-white'
                        }`}>{message.content}</p>
                      </div>
                      {message.type === 'user' && (
                        <User size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming Message */}
              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-3 max-w-[70%] border border-white/10">
                    <div className="flex items-start gap-2">
                      <Bot size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed text-white">
                          {streamingMessage}
                          <span className="inline-block w-1 h-4 bg-emerald-400 ml-1 animate-pulse"></span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && !streamingMessage && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-3 max-w-[70%] border border-white/10">
                    <div className="flex items-center gap-2">
                      <Bot size={16} className="text-emerald-400" />
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Session Management Buttons */}
      {isConnected && (
        <div className="px-6 py-3 border-t border-white/5 bg-white/5">
          <div className="flex gap-3">
            <button
              onClick={onStartNewSession}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start New Session
            </button>
            <button
              onClick={onLoadPreviousSession}
              className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 rounded-xl hover:bg-emerald-500/30 hover:border-emerald-400/60 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Load Previous
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/5 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isConnected ? "Type your message here..." : "Connecting to server..."}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/40 disabled:opacity-50"
            disabled={!isConnected || isTyping || streamingMessage}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping || !isConnected || streamingMessage}
            className="px-4 py-3 bg-emerald-500/80 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget; 