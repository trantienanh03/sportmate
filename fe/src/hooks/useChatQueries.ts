import { useQuery } from '@tanstack/react-query';
import { chatService, type RoomSummaryDto, type MessageDto } from '../services/chatService';

// Định nghĩa Query Keys quản lý cache tin nhắn & phòng chat
export const chatKeys = {
  all: ['chats'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  messages: (roomId: number) => [...chatKeys.all, 'messages', roomId] as const,
};

// Hook truy vấn danh sách toàn bộ các phòng trò chuyện của người dùng hiện tại
export function useChatRoomsQuery() {
  return useQuery<RoomSummaryDto[]>({
    queryKey: chatKeys.rooms(),
    queryFn: () => chatService.getRooms(),
  });
}

// Hook truy vấn lịch sử tin nhắn của một phòng cụ thể
export function useChatMessagesQuery(roomId: number, enabled: boolean) {
  return useQuery<MessageDto[]>({
    queryKey: chatKeys.messages(roomId),
    queryFn: () => chatService.getMessages(roomId),
    enabled: enabled && !isNaN(roomId) && roomId > 0,
  });
}
