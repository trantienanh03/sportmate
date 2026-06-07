import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { MessageDto } from "../services/chatService";

const WS_URL = "http://localhost:8080/ws";

export const useWebSocket = (
  roomId: number | null,
  onMessageReceived: (msg: MessageDto) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {},
      debug: (_str) => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);

      client.subscribe(`/topic/room/${roomId}`, (message) => {
        if (message.body) {
          const parsedMsg: MessageDto = JSON.parse(message.body);
          onMessageReceived(parsedMsg);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP Error:", frame.headers["message"]);
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        setIsConnected(false);
      }
    };
    // Chỉ phụ thuộc vào roomId để tránh việc reconnect liên tục khi callback onMessageReceived (thường thay đổi mỗi lần render) được truyền vào.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const sendMessage = (content: string, type = "TEXT", metadata: string | null = null) => {
    if (clientRef.current && isConnected && roomId) {
      clientRef.current.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({ roomId, type, content, metadata }),
      });
    } else {
      console.error("Cannot send message: not connected to websocket");
    }
  };

  return { sendMessage, isConnected };
};
