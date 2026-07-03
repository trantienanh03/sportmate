import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { MessageDto } from "../services/chatService";

const WS_URL = "/ws";

export const useWebSocket = (
  roomId: number | null,
  onMessageReceived: (msg: MessageDto) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  // Dùng ref để giữ callback luôn mới nhất mà không cần reconnect WebSocket.
  // Đây là pattern chuẩn để tránh stale closure trong hooks.
  const onMessageReceivedRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

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
          // Dùng ref để luôn gọi callback mới nhất, tránh stale closure
          onMessageReceivedRef.current(parsedMsg);
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
    // Chỉ phụ thuộc vào roomId: khi đổi phòng mới reconnect.
    // onMessageReceived được giữ qua ref nên không cần trong dep array.
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

