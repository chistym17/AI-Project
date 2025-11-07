import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Wifi, WifiOff } from 'lucide-react';

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
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100">
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
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Assistant</h3>
              <p className="text-emerald-100 text-sm">
                {isConnected ? "Ready to take your order" : "Connecting..."}
              </p>
              {currentSessionId && (
                <p className="text-emerald-200 text-xs mt-1 font-mono">
                  Session: {currentSessionId.slice(-8)}...
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi size={16} className="text-emerald-100" />
            ) : (
              <WifiOff size={16} className="text-red-200" />
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'bot' && (
                  <Bot size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-emerald-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.type === 'user' && (
                  <User size={16} className="text-white mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[70%]">
              <div className="flex items-start gap-2">
                <Bot size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">
                    {streamingMessage}
                    <span className="inline-block w-1 h-4 bg-emerald-600 ml-1 animate-pulse"></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && !streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[70%]">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-emerald-600" />
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Session Management Buttons */}
      {isConnected && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onStartNewSession}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start New Session
            </button>
            <button
              onClick={onLoadPreviousSession}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
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
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isConnected ? "Type your message here..." : "Connecting to server..."}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            disabled={!isConnected || isTyping || streamingMessage}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping || !isConnected || streamingMessage}
            className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget; 