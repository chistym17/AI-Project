// components/textflow/hooks/useWebSocketStream.js
import { useEffect, useRef, useCallback } from "react";
import { useTextflowStore } from "./useTextflowStore.js";
import { openTextWS } from "../api/textflowApi.js";

export function useWebSocketStream(enabled, assistantId) {
  const wsRef = useRef(null);
  const append = useTextflowStore((s) => s.appendConsole);
  const setRunId = useTextflowStore((s) => s.setRunId);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    if (!enabled) {
      append({ ts: Date.now(), kind: "info", text: "WebSocket disabled (enabled=false)" });
      return;
    }
    
    // CRITICAL: Validate assistantId before attempting connection
    if (!assistantId || assistantId === 'undefined' || assistantId === 'null') {
      append({ ts: Date.now(), kind: "error", text: `Cannot connect: Invalid assistantId (${assistantId})` });
      return;
    }
    
    const connect = () => {
      append({ ts: Date.now(), kind: "info", text: `Connecting to /ws/text with assistant: ${assistantId}` });
      
      // FIXED: Pass assistantId to openTextWS
      const ws = openTextWS(assistantId);
      
      if (!ws) {
        append({ ts: Date.now(), kind: "error", text: "Failed to create WebSocket" });
        return;
      }
      
      wsRef.current = ws;

      ws.onopen = () => {
        append({ ts: Date.now(), kind: "info", text: "✅ Connected to /ws/text" });
        reconnectAttempts.current = 0;
        
        // Send session start
        ws.send(JSON.stringify({ type: "start_session", assistant_id: assistantId }));
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          
          // Handle different event types
          switch (msg.type) {
            case "connection":
              append({ 
                ts: Date.now(), 
                kind: "info", 
                text: `Connection confirmed: ${msg.status}, session: ${msg.session_id}` 
              });
              break;
              
            case "flow_status":
              append({ 
                ts: Date.now(), 
                kind: "info", 
                text: `Flow status: ${msg.has_flow ? `${msg.node_count} nodes` : 'No flow configured'}` 
              });
              break;
            
            case "session_started":
              if (msg.run_id) {
                setRunId(msg.run_id);
                append({ ts: Date.now(), kind: "info", text: `Session started: ${msg.run_id}` });
              }
              break;
              
            case "run_started":
              setRunId(msg.run_id);
              append({ 
                ts: Date.now(), 
                kind: "info", 
                text: `Run started: ${msg.run_id}, status: ${msg.status}` 
              });
              break;
              
            case "node_started":
              append({ ts: Date.now(), kind: "info", text: `→ Node started: ${msg.node_id}` });
              break;
              
            case "node_output_partial":
              append({ ts: Date.now(), kind: "chunk", text: msg.chunk });
              break;
              
            case "node_output":
              append({ 
                ts: Date.now(), 
                kind: "info", 
                text: `✓ Node ${msg.node_id} complete: ${JSON.stringify(msg.output).slice(0, 100)}...` 
              });
              break;
              
            case "node_error":
            case "error":
              append({ ts: Date.now(), kind: "error", text: `✗ Error: ${msg.error || msg.message}` });
              break;
              
            case "session_end":
              append({ ts: Date.now(), kind: "info", text: "✓ Session complete" });
              break;
              
            case "stream_chunk":
              append({ ts: Date.now(), kind: "chunk", text: msg.content });
              break;
              
            case "stream_complete":
              append({ ts: Date.now(), kind: "info", text: `Stream complete: ${msg.content}` });
              break;
              
            case "heartbeat":
            case "hb":
              // Heartbeat - silent (or uncomment to debug)
              // append({ ts: Date.now(), kind: "info", text: "💓 Heartbeat" });
              break;
              
            default:
              append({ ts: Date.now(), kind: "info", text: `Unknown message type: ${msg.type}` });
          }
        } catch (e) {
          // Not JSON, just display raw
          append({ ts: Date.now(), kind: "info", text: ev.data });
        }
      };

      ws.onerror = (err) => {
        append({ ts: Date.now(), kind: "error", text: "WebSocket error occurred" });
        console.error("WebSocket error:", err);
      };

      ws.onclose = (ev) => {
        append({ ts: Date.now(), kind: "info", text: `WS closed (code: ${ev.code}, reason: ${ev.reason || 'none'})` });
        wsRef.current = null;
        
        // Auto-reconnect if not a clean close and under retry limit
        if (ev.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = 2000 * reconnectAttempts.current;
          append({ 
            ts: Date.now(), 
            kind: "info", 
            text: `Reconnecting in ${delay/1000}s... (${reconnectAttempts.current}/${maxReconnectAttempts})` 
          });
          setTimeout(connect, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          append({ 
            ts: Date.now(), 
            kind: "error", 
            text: "Max reconnection attempts reached. Please refresh the page." 
          });
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        append({ ts: Date.now(), kind: "info", text: "Closing WebSocket (component unmounted)" });
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    };
  }, [enabled, assistantId, append, setRunId]);

  const sendMessage = useCallback((text, opts = {}) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      append({ ts: Date.now(), kind: "error", text: "WebSocket not connected" });
      return false;
    }
    
    const payload = { 
      type: "user_message", 
      text, 
      assistant_id: opts.assistant_id || assistantId,
      ...opts 
    };
    
    ws.send(JSON.stringify(payload));
    append({ ts: Date.now(), kind: "info", text: `→ Sent: ${text}` });
    return true;
  }, [append, assistantId]);

  const isConnected = useCallback(() => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  }, []);

  return { sendMessage, isConnected, wsRef };
}