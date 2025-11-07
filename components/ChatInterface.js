import React, { useState, useRef, useEffect } from 'react';
import ChatWidget from './ChatWidget';
import { useAssistant } from '../lib/assistantContext';
import AssistantSelector from './AssistantSelector';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const { assistantId } = useAssistant();

  const connectWebSocket = (sessionId = null) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Closing existing WebSocket connection');
      ws.close();
      setWs(null);
      setIsConnected(false);
    }

    const base = process.env.NEXT_PUBLIC_BACKEND_WS || "wss://esapdev.xyz:7000/agentbuilder/api/ws/chat";
    const activeAssistantId = assistantId || "7b50109b-b041-4d4a-824c-37eb7cf64b09";
    
    let wsUrl = `${base}?assistant_id=${activeAssistantId}`;
    if (sessionId) {
      wsUrl += `&session_id=${sessionId}`;
    }
    
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('Connected to chat WebSocket', sessionId ? `with session: ${sessionId}` : 'reusing previous session');
      setIsConnected(true);
      setWs(websocket);
      if (sessionId) {
        setCurrentSessionId(sessionId);
      }
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stream_chunk') {
          setStreamingMessage(prev => prev ? prev + data.content : data.content);
          setIsTyping(false);
        } else if (data.type === 'stream_complete') {
          const botMessage = {
            id: Date.now(),
            type: 'bot',
            content: data.content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setStreamingMessage(null);
          setIsTyping(false);
        } else if (data.type === 'error') {
          const errorMessage = {
            id: Date.now(),
            type: 'bot',
            content: data.content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setStreamingMessage(null);
          setIsTyping(false);
        } else {
          const botMessage = {
            id: Date.now(),
            type: 'bot',
            content: event.data,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }
      } catch (error) {
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          content: event.data,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from chat WebSocket');
      setIsConnected(false);
      setStreamingMessage(null);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setStreamingMessage(null);
    };

    return websocket;
  };

  const startNewSession = () => {
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setMessages([]);
    setStreamingMessage(null);
    connectWebSocket(newSessionId);
  };

  const loadPreviousSession = () => {
    setMessages([]);
    setStreamingMessage(null);
    setCurrentSessionId(null);
    connectWebSocket();
  };

  useEffect(() => {
    let websocket = null;
    let reconnectTimeout = null;

    const initialConnect = () => {
      websocket = connectWebSocket();
    };

    initialConnect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (websocket) {
        websocket.close();
      }
      setWs(null);
      setIsConnected(false);
    };
  }, [assistantId]);

  const handleSendMessage = async (message) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setStreamingMessage(null);
    setIsTyping(true);
    ws.send(JSON.stringify({ type: 'user', content: message }));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-4rem)] pt-16">
      {/* Mobile selector (visible) */}
      <div className="md:hidden sticky top-16 z-10 bg-white border-b border-gray-100 p-3">
        <AssistantSelector />
      </div>

      {/* Desktop sidebar (slim) */}
      <div className="hidden md:flex md:flex-col md:w-64 lg:w-80 p-4 lg:p-5 overflow-y-auto border-r border-gray-100">
        <AssistantSelector />
      </div>

      {/* Chat area */}
      <div className="flex-1 min-w-0 p-3 md:p-5">
        <ChatWidget
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          isConnected={isConnected}
          streamingMessage={streamingMessage}
          onStartNewSession={startNewSession}
          onLoadPreviousSession={loadPreviousSession}
          currentSessionId={currentSessionId}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
